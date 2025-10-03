from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction as db_transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal
import uuid
import requests

from transactions.models import Transaction
from accounts.models import Wallet

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    amount = request.data.get('amount')
    description = request.data.get('description', 'Dépôt WaxiPay')
    
    if not amount:
        return Response({'success': False, 'error': 'Montant requis'}, status=400)
    
    try:
        amount = Decimal(amount)
        if amount <= 0:
            raise ValueError()
    except:
        return Response({'success': False, 'error': 'Montant invalide'}, status=400)
    
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
    
    paytech_data = {
        'item_name': description,
        'item_price': int(amount),
        'currency': 'XOF',
        'ref_command': reference,
        'command_name': description,
        'env': 'test',
        'custom_field': str(transaction_obj.id),
        'success_url': 'https://072a8319c6bb.ngrok-free.app/payments/success/',
        'cancel_url': 'https://072a8319c6bb.ngrok-free.app/payments/cancel/',
        'ipn_url': 'https://072a8319c6bb.ngrok-free.app/payments/ipn/',
    }
    
    paytech_response = requests.post(
        'https://paytech.sn/api/payment/request-payment',
        json=paytech_data,
        headers={
            'API_KEY': '99b49f75593e3466ed14d78001c23b3daf797e508a455aeec1d91aa702c05f16',
            'API_SECRET': 'a2a1f1f2c64a5ff2a353fe6f07899797faafef71228be10343ffff53cea72e37',
            'Content-Type': 'application/json'
        }
    )
    
    if paytech_response.status_code == 200:
        response_data = paytech_response.json()
        return Response({
            'payment_url': response_data.get('redirect_url'),
            'token': response_data.get('token'),
            'amount': paytech_data['item_price'],
            'reference': paytech_data['ref_command']
        })
    
    return Response({
        'error': 'Erreur lors de la création du paiement PayTech',
        'details': paytech_response.text
    }, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def payment_ipn(request):
    type_event = request.POST.get('type_event')
    custom_field = request.POST.get('custom_field', '')
    transaction_id = custom_field
    
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
        
        elif type_event == 'sale_canceled':
            transaction_obj.status = 'cancelled'
            transaction_obj.save()
        
        return Response({'message': 'IPN OK'})
        
    except Transaction.DoesNotExist:
        return Response({'error': 'Transaction introuvable'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_success(request):
    return Response({'success': True, 'message': 'Paiement effectué avec succès'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_cancel(request):
    return Response({'success': False, 'message': 'Paiement annulé'})