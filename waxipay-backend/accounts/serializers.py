# ===========================================
# accounts/serializers.py
# ===========================================
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Wallet

class WalletSerializer(serializers.ModelSerializer):
    balance_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'balance_formatted', 'currency', 'is_active', 'created_at']
        read_only_fields = ['id', 'balance', 'created_at']
    
    def get_balance_formatted(self, obj):
        return f"{obj.balance:,.0f}".replace(',', ' ')


class UserSerializer(serializers.ModelSerializer):
    wallet = WalletSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'email', 'full_name', 'user_type', 
                  'is_verified', 'wallet', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['phone_number', 'email', 'full_name', 'user_type', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        Wallet.objects.create(user=user)
        return user