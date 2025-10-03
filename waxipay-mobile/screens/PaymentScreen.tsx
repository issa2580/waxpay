import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import { initiatePayment } from "../store/slices/transactionSlice";
import { useAppDispatch, useAppSelector } from "../store/store";

const PaymentScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.transactions);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handlePayment = async () => {
    if (!amount) {
      Alert.alert("Erreur", "Veuillez entrer un montant");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }

    try {
      const result = await dispatch(
        initiatePayment({
          amount,
          payment_method: "wave", // Valeur par défaut, ignorée par PayTek
          description: description || "Dépôt WaxiPay",
        })
      ).unwrap();

      if (result.payment_url) {
        const supported = await Linking.canOpenURL(result.payment_url);
        if (supported) {
          await Linking.openURL(result.payment_url);

          Alert.alert(
            "Paiement en cours",
            "Vous allez être redirigé vers PayTech",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert("Erreur", "Impossible d'ouvrir le lien de paiement");
        }
      }
    } catch (err: any) {
      Alert.alert("Erreur", err || "Échec de l'initialisation du paiement");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recevoir un paiement</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            PayTek vous permettra de choisir parmi Wave, Orange Money, Free
            Money ou Carte Bancaire
          </Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Montant à recevoir</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#CCC"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={styles.currency}>FCFA</Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.inputLabel}>Description (optionnel)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Ex: Course taxi, Livraison..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.methodsPreview}>
          <Text style={styles.methodsTitle}>
            Méthodes disponibles sur PayTek
          </Text>
          <View style={styles.methodsGrid}>
            <View style={styles.methodPreviewCard}>
              <Text style={styles.methodPreviewIcon}>🌊</Text>
              <Text style={styles.methodPreviewName}>Wave</Text>
            </View>
            <View style={styles.methodPreviewCard}>
              <Text style={styles.methodPreviewIcon}>🟠</Text>
              <Text style={styles.methodPreviewName}>Orange Money</Text>
            </View>
            <View style={styles.methodPreviewCard}>
              <Text style={styles.methodPreviewIcon}>🆓</Text>
              <Text style={styles.methodPreviewName}>Free Money</Text>
            </View>
            <View style={styles.methodPreviewCard}>
              <Text style={styles.methodPreviewIcon}>💳</Text>
              <Text style={styles.methodPreviewName}>Carte Bancaire</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !amount && styles.submitButtonDisabled]}
          onPress={handlePayment}
          disabled={loading || !amount}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Continuer avec PayTek</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  infoCard: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },
  amountSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: "600",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  amountInput: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    minWidth: 100,
  },
  currency: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: "top",
  },
  methodsPreview: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  methodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  methodPreviewCard: {
    width: "48%",
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  methodPreviewIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodPreviewName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentScreen;
