import React, { useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import {
  fetchTransactions,
  fetchTransactionStats,
} from "../store/slices/transactionSlice";
import { fetchWallet } from "../store/slices/walletSlice";
import { useAppDispatch, useAppSelector } from "../store/store";

const DashboardScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { wallet } = useAppSelector((state) => state.wallet);
  const { transactions, loading } = useAppSelector(
    (state) => state.transactions
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
    dispatch(fetchTransactionStats());
  };

  const quickActions = [
    {
      id: "1",
      title: "Recevoir",
      icon: "📥",
      color: Colors.success,
      screen: "Payment",
    },
    {
      id: "2",
      title: "Envoyer",
      icon: "📤",
      color: Colors.secondary,
      screen: "Payment",
    },
    {
      id: "3",
      title: "Retirer",
      icon: "💸",
      color: Colors.primary,
      screen: "Payment",
    },
    {
      id: "4",
      title: "Historique",
      icon: "📊",
      color: "#9C27B0",
      screen: "Transactions",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.name}>{user?.full_name || "Utilisateur"}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.substring(0, 2).toUpperCase() || "U"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceAmount}>
            {wallet?.balance_formatted || "0"} FCFA
          </Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.balanceButton}>
              <Text style={styles.balanceButtonText}>➕ Recharger</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.balanceButton, styles.balanceButtonOutline]}
            >
              <Text style={styles.balanceButtonTextOutline}>📊 Détails</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.color + "20" },
                ]}
              >
                <Text style={styles.quickActionEmoji}>{action.icon}</Text>
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Transactions récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 3).map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionIcon}>
              <Text style={styles.transactionEmoji}>
                {transaction.transaction_type === "payment_in" ||
                transaction.transaction_type === "deposit"
                  ? "📥"
                  : "📤"}
              </Text>
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {transaction.description ||
                  transaction.transaction_type_display}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.created_at).toLocaleString("fr-FR")}
              </Text>
            </View>
            <View style={styles.transactionRight}>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      transaction.transaction_type === "payment_in" ||
                      transaction.transaction_type === "deposit"
                        ? Colors.success
                        : Colors.error,
                  },
                ]}
              >
                {transaction.transaction_type === "payment_in" ||
                transaction.transaction_type === "deposit"
                  ? "+"
                  : "-"}
                {transaction.amount_formatted} F
              </Text>
              <View style={styles.transactionBadge}>
                <Text style={styles.transactionMethod}>
                  {transaction.payment_method_display}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    color: Colors.white,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: "row",
    gap: 12,
  },
  balanceButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  balanceButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  balanceButtonText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  balanceButtonTextOutline: {
    color: Colors.white,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  transactionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tertiary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 24,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  transactionBadge: {
    backgroundColor: Colors.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  transactionMethod: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});

export default DashboardScreen;
