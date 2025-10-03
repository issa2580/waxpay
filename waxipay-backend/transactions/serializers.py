# ===========================================
# transactions/serializers.py
# ===========================================
from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    amount_formatted = serializers.SerializerMethodField()
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'transaction_type', 'transaction_type_display',
            'payment_method', 'payment_method_display', 'amount', 'amount_formatted',
            'currency', 'fees', 'status', 'status_display', 'reference', 
            'external_reference', 'recipient_phone', 'description', 
            'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'user', 'reference', 'fees', 'status', 
                           'external_reference', 'created_at', 'completed_at']
    
    def get_amount_formatted(self, obj):
        return f"{obj.amount:,.0f}".replace(',', ' ')