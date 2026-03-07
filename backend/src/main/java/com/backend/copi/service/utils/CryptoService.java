package com.backend.copi.service.utils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CryptoService {

    private final SecretKeySpec key;

    public CryptoService(@Value("${app.crypto.secret}") String secret) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            this.key = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // encrypt: Handles encrypt in the current backend workflow.
    public String encrypt(String value) {

        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, key);

            byte[] encrypted =
                    cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(encrypted);

        } catch (Exception e) {
            throw new RuntimeException("Encryption error", e);
        }
    }

    // decrypt: Handles decrypt in the current backend workflow.
    public String decrypt(String encryptedValue) {

        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, key);

            byte[] decoded =
                    Base64.getDecoder().decode(encryptedValue);

            return new String(cipher.doFinal(decoded),
                              StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new RuntimeException("Decryption error", e);
        }
    }
}
