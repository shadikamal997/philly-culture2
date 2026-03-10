import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: '#FFFFFF',
  },
  border: {
    border: '8px solid #DC2626',
    padding: 40,
    height: '100%',
  },
  innerBorder: {
    border: '2px solid #DC2626',
    padding: 30,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    color: '#DC2626',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#374151',
  },
  recipientName: {
    fontSize: 36,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1F2937',
  },
  completionText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#4B5563',
  },
  courseName: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#DC2626',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #E5E7EB',
    width: '100%',
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
  },
  signature: {
    marginTop: 40,
    textAlign: 'center',
  },
  signatureLine: {
    width: 200,
    borderBottom: '1px solid #000',
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export interface CertificateData {
  recipientName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
}

export const generateCertificateDocument = (data: CertificateData) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.innerBorder}>
          <Text style={styles.title}>Certificate of Completion</Text>
          
          <Text style={styles.subtitle}>This is to certify that</Text>
          
          <Text style={styles.recipientName}>{data.recipientName}</Text>
          
          <Text style={styles.completionText}>has successfully completed</Text>
          
          <Text style={styles.courseName}>{data.courseName}</Text>
          
          <Text style={styles.completionText}>
            Completion Date: {data.completionDate}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Certificate ID: {data.certificateId}
            </Text>
            <Text style={styles.footerText}>
              Philly Culture Academy
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
