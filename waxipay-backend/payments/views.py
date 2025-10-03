from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction as db_transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal
import uuid
import json
import logging

from transactions.models import Transaction
from accounts.models import Wallet
from .paytek_service import PaytechService

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    amount = request.data.get('amount')
    description = request.data.get('description', 'Dépôt WaxiPay')
    
    if not amount:
        return Response(
            {'success': False, 'error': 'Montant requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        amount = Decimal(amount)
        if amount <= 0:
            raise ValueError("Le montant doit être positif")
    except (ValueError, TypeError):
        return Response(
            {'success': False, 'error': 'Montant invalide'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    reference = f"WXP-{uuid.uuid4().hex[:12].upper()}"
    transaction_obj = Transaction.objects.create(
        user=request.user,
        transaction_type='deposit',
        payment_method='wave',
        amount=amount,
        reference=reference,
        description=description,
        status='pending'
    )
    
    custom_field = {
        'transaction_id': str(transaction_obj.id),
        'user_id': str(request.user.id),
    }
    
    payment_method = "Orange Money,Wave,Free Money,Carte Bancaire"
    
    response = PaytechService.request_payment(
        item_name=description,
        item_price=int(amount),
        ref_command=reference,
        custom_field=custom_field,
        payment_method=payment_method,
        user=request.user
    )
    
    if response.get('success') == 1:
        transaction_obj.external_reference = response.get('token')
        transaction_obj.status = 'processing'
        transaction_obj.save()
        
        return Response({
            'success': True,
            'message': 'Paiement initié avec succès',
            'data': {
                'transaction_id': str(transaction_obj.id),
                'reference': reference,
                'payment_url': response.get('redirect_url') or response.get('redirectUrl'),
                'external_reference': response.get('token')
            }
        })
    else:
        transaction_obj.status = 'failed'
        transaction_obj.save()
        return Response(
            {
                'success': False,
                'error': response.get('message', 'Échec de l\'initialisation du paiement')
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def payment_ipn(request):
    if not PaytechService.verify_ipn(request):
        logger.warning('Invalid PayTech IPN signature')
        return Response(
            {'error': 'Signature invalide'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    type_event = request.POST.get('type_event')
    custom_field = json.loads(request.POST.get('custom_field', '{}'))
    ref_command = request.POST.get('ref_command')
    
    transaction_id = custom_field.get('transaction_id')
    
    try:
        transaction_obj = Transaction.objects.get(id=transaction_id)
        
        if type_event == 'sale_complete':
            with db_transaction.atomic():
                transaction_obj.status = 'completed'
                transaction_obj.completed_at = timezone.now()
                transaction_obj.save()
                
                wallet = transaction_obj.user.wallet
                wallet.balance += transaction_obj.amount
                wallet.save()
                
                logger.info(f'Transaction {ref_command} completed via IPN')
        
        elif type_event == 'sale_canceled':
            transaction_obj.status = 'cancelled'
            transaction_obj.save()
            logger.info(f'Transaction {ref_command} cancelled via IPN')
        
        return Response({'message': 'IPN OK'}, status=status.HTTP_200_OK)
        
    except Transaction.DoesNotExist:
        logger.error(f'Transaction not found: {transaction_id}')
        return Response(
            {'error': 'Transaction introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_success(request):
    return Response({
        'success': True,
        'message': 'Paiement effectué avec succès. Vérification en cours...'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_cancel(request):
    return Response({
        'success': False,
        'message': 'Paiement annulé'
    })