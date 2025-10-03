import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import { register } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/store";

const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [userType, setUserType] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);

  const userTypes = [
    { id: "driver", label: "Chauffeur", icon: "🚕" },
    { id: "merchant", label: "Commerçant", icon: "🏪" },
    { id: "deliverer", label: "Livreur", icon: "🛵" },
    { id: "individual", label: "Particulier", icon: "👤" },
  ];

  const handleRegister = async () => {
    if (!fullName || !phoneNumber || !password || !passwordConfirm) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs requis");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 6 caractères"
      );
      return;
    }

    try {
      await dispatch(
        register({
          phone_number: phoneNumber,
          email,
          full_name: fullName,
          user_type: userType,
          password,
          password_confirm: passwordConfirm,
        })
      ).unwrap();
    } catch (err: any) {
      Alert.alert("Erreur", err || "Échec de l'inscription");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>
          Rejoignez WaxiPay dès aujourd&apos;hui
        </Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Nom complet</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Amadou Diallo"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Numéro de téléphone</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>📱</Text>
            <TextInput
              style={styles.input}
              placeholder="77 123 45 67"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email (optionnel)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Type de compte</Text>
          <View style={styles.typeGrid}>
            {userTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  userType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => setUserType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={styles.typeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 caractères"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.icon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Retapez votre mot de passe"
              placeholderTextColor="#999"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Créer mon compte</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Déjà un compte? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 15,
    height: 56,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 16,
    alignItems: "center",
  },
  typeCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary + "08",
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
