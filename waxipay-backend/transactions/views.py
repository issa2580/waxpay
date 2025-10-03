# ===========================================
# transactions/views.py
# ===========================================
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionListView(generics.ListAPIView):
    """Liste des transactions avec filtres"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        
        transaction_type = self.request.query_params.get('type')
        payment_method = self.request.query_params.get('payment_method')
        status_filter = self.request.query_params.get('status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset


class TransactionDetailView(generics.RetrieveAPIView):
    """Détail d'une transaction"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class TransactionStatsView(APIView):
    """Statistiques des transactions"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        total_received = Transaction.objects.filter(
            user=user,
            transaction_type='payment_in',
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_sent = Transaction.objects.filter(
            user=user,
            transaction_type__in=['payment_out', 'withdrawal'],
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_transactions = Transaction.objects.filter(
            user=user,
            created_at__gte=month_start,
            status='completed'
        ).count()
        
        week_ago = datetime.now() - timedelta(days=7)
        weekly_data = Transaction.objects.filter(
            user=user,
            created_at__gte=week_ago,
            status='completed'
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('date')
        
        return Response({
            'success': True,
            'data': {
                'total_received': float(total_received),
                'total_sent': float(total_sent),
                'month_transactions': month_transactions,
                'weekly_data': list(weekly_data),
                'wallet_balance': float(user.wallet.balance)
            }
        })
