import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "../types";

const styles = StyleSheet.create({
  page: { padding: 38, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.4, color: "#1a1a1a" },
  header: { marginBottom: 12, borderBottomWidth: 3, borderBottomColor: "#234e70", paddingBottom: 8 },
  name: { fontSize: 22, fontWeight: "bold", color: "#234e70", marginBottom: 2 },
  contact: { fontSize: 9, color: "#555" },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#234e70", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: "#234e70", paddingBottom: 2 },
  summary: { fontSize: 10, lineHeight: 1.5, color: "#333" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  skillTag: { fontSize: 9, backgroundColor: "#edf2f7", padding: "2 8", borderRadius: 1, color: "#234e70", fontWeight: "bold" },
  expItem: { marginBottom: 9 },
  expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
  expRole: { fontSize: 11, fontWeight: "bold", color: "#234e70" },
  expDates: { fontSize: 9, color: "#718096", fontWeight: "bold" },
  expCompany: { fontSize: 10, color: "#444", marginBottom: 3, fontStyle: "italic" },
  bullet: { fontSize: 10, marginLeft: 12, marginBottom: 2, lineHeight: 1.4 },
  eduItem: { marginBottom: 5 },
  eduRow: { flexDirection: "row", justifyContent: "space-between" },
  eduDegree: { fontSize: 10, fontWeight: "bold" },
  eduDate: { fontSize: 9, color: "#718096" },
  eduSchool: { fontSize: 10, color: "#444" },
  projItem: { marginBottom: 6 },
  projName: { fontSize: 10, fontWeight: "bold", color: "#234e70" },
  projDesc: { fontSize: 10, color: "#333", marginTop: 1 },
  projTech: { fontSize: 9, color: "#718096", marginTop: 1 },
  certItem: { marginBottom: 3, flexDirection: "row", justifyContent: "space-between" },
  certName: { fontSize: 10, fontWeight: "bold" },
  certDetails: { fontSize: 9, color: "#718096" },
});

export function Big4Professional({ data }: { data: ResumeData }) {
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
          <Text style={styles.contact}>{contactParts.join("  |  ")}</Text>
        </View>

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View style={styles.skillsWrap}>
              {data.skills.map((s, i) => (
                <Text key={i} style={styles.skillTag}>{s}</Text>
              ))}
            </View>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={styles.expItem}>
                <View style={styles.expRow}>
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

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.eduItem}>
                <View style={styles.eduRow}>
                  <Text style={styles.eduDegree}>{edu.degree} in {edu.field}</Text>
                  <Text style={styles.eduDate}>{edu.startDate} - {edu.endDate}</Text>
                </View>
                <Text style={styles.eduSchool}>{edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</Text>
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notable Projects</Text>
            {projects.map((proj, i) => (
              <View key={i} style={styles.projItem}>
                <Text style={styles.projName}>{proj.name}</Text>
                <Text style={styles.projDesc}>{proj.description}</Text>
                {proj.technologies.length > 0 && (
                  <Text style={styles.projTech}>Technologies: {proj.technologies.join(", ")}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications & Credentials</Text>
            {certifications.map((cert, i) => (
              <View key={i} style={styles.certItem}>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.certDetails}>{cert.issuer} | {cert.date}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
