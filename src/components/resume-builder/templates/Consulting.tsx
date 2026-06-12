import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "../types";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.4, color: "#1a1a1a" },
  header: { marginBottom: 14 },
  name: { fontSize: 22, fontWeight: "bold", color: "#2d3748", marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#2b6cb0", fontWeight: "bold", marginBottom: 4 },
  contact: { fontSize: 9, color: "#555" },
  divider: { height: 1.5, backgroundColor: "#2b6cb0", marginTop: 8, marginBottom: 12 },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#2b6cb0", textTransform: "uppercase", marginBottom: 5, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingBottom: 2 },
  summary: { fontSize: 10, lineHeight: 1.5, color: "#333" },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  skillItem: { fontSize: 9, backgroundColor: "#ebf8ff", color: "#2b6cb0", padding: "2 8", borderRadius: 3, fontWeight: "bold" },
  expItem: { marginBottom: 9, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: "#2b6cb0" },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
  expRole: { fontSize: 11, fontWeight: "bold", color: "#2d3748" },
  expDates: { fontSize: 9, color: "#a0aec0" },
  expCompany: { fontSize: 10, color: "#4a5568", marginBottom: 3 },
  bullet: { fontSize: 10, marginLeft: 12, marginBottom: 2 },
  projHeader: { marginBottom: 2 },
  projName: { fontSize: 10, fontWeight: "bold", color: "#2d3748" },
  projDesc: { fontSize: 10, color: "#4a5568", marginTop: 1, marginLeft: 8 },
  projTech: { fontSize: 9, color: "#a0aec0", marginTop: 1, marginLeft: 8 },
  eduItem: { marginBottom: 5, flexDirection: "row", justifyContent: "space-between" },
  eduLeft: { flex: 1 },
  eduDegree: { fontSize: 10, fontWeight: "bold" },
  eduSchool: { fontSize: 10, color: "#4a5568" },
  eduDate: { fontSize: 9, color: "#a0aec0" },
  certItem: { marginBottom: 3 },
  certText: { fontSize: 10 },
});

export function Consulting({ data }: { data: ResumeData }) {
  const contactParts = [data.email, data.phone, data.location, data.linkedin].filter(Boolean);
  const experience = (data.experience || []) as unknown as ExperienceItem[];
  const education = (data.education || []) as unknown as EducationItem[];
  const projects = (data.projects || []) as unknown as ProjectItem[];
  const certifications = (data.certifications || []) as unknown as CertificationItem[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName}</Text>
          <Text style={styles.subtitle}>Management Consultant</Text>
          <Text style={styles.contact}>{contactParts.join("  |  ")}</Text>
          <View style={styles.divider} />
        </View>

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Profile</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Areas of Expertise</Text>
            <View style={styles.skillsGrid}>
              {data.skills.map((s, i) => (
                <Text key={i} style={styles.skillItem}>{s}</Text>
              ))}
            </View>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Engagement Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expRole}>{exp.role}</Text>
                  <Text style={styles.expDates}>{exp.startDate} - {exp.endDate}</Text>
                </View>
                <Text style={styles.expCompany}>{exp.company}</Text>
                {(exp.bulletPoints || []).map((bp, j) => (
                  <Text key={j} style={styles.bullet}>{"\u2022"} {bp}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Engagements</Text>
            {projects.map((proj, i) => (
              <View key={i} style={styles.projHeader}>
                <Text style={styles.projName}>{proj.name}</Text>
                <Text style={styles.projDesc}>{proj.description}</Text>
                {proj.technologies.length > 0 && (
                  <Text style={styles.projTech}>Tools: {proj.technologies.join(", ")}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.eduItem}>
                <View style={styles.eduLeft}>
                  <Text style={styles.eduDegree}>{edu.degree} in {edu.field}</Text>
                  <Text style={styles.eduSchool}>{edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</Text>
                </View>
                <Text style={styles.eduDate}>{edu.startDate} - {edu.endDate}</Text>
              </View>
            ))}
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert, i) => (
              <View key={i} style={styles.certItem}>
                <Text style={styles.certText}>{cert.name} | {cert.issuer} | {cert.date}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
