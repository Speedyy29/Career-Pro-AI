import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "../types";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.4, color: "#1a1a1a" },
  header: { marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  contact: { fontSize: 9, color: "#444", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: "#1a1a1a", paddingBottom: 3, marginBottom: 6 },
  summary: { fontSize: 10, lineHeight: 1.5, color: "#333" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  skillTag: { fontSize: 9, backgroundColor: "#f0f0f0", padding: "3 6", borderRadius: 2 },
  expItem: { marginBottom: 8 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  expRole: { fontSize: 11, fontWeight: "bold" },
  expDates: { fontSize: 9, color: "#666" },
  expCompany: { fontSize: 10, color: "#444", marginBottom: 3 },
  bullet: { fontSize: 10, marginLeft: 12, marginBottom: 2, lineHeight: 1.4 },
  eduItem: { marginBottom: 6 },
  eduDegree: { fontSize: 10, fontWeight: "bold" },
  eduSchool: { fontSize: 10, color: "#444" },
  eduDate: { fontSize: 9, color: "#666" },
  projItem: { marginBottom: 6 },
  projName: { fontSize: 10, fontWeight: "bold" },
  projDesc: { fontSize: 10, color: "#333", marginTop: 1 },
  projTech: { fontSize: 9, color: "#666", marginTop: 1 },
  certItem: { marginBottom: 4, flexDirection: "row", justifyContent: "space-between" },
  certName: { fontSize: 10, fontWeight: "bold" },
  certDetails: { fontSize: 9, color: "#666" },
});

export function ModernATS({ data }: { data: ResumeData }) {
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
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsWrap}>
              {data.skills.map((s, i) => (
                <Text key={i} style={styles.skillTag}>{s}</Text>
              ))}
            </View>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
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

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.eduItem}>
                <Text style={styles.eduDegree}>{edu.degree} in {edu.field}</Text>
                <Text style={styles.eduSchool}>{edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</Text>
                <Text style={styles.eduDate}>{edu.startDate} - {edu.endDate}</Text>
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, i) => (
              <View key={i} style={styles.projItem}>
                <Text style={styles.projName}>{proj.name}{proj.link ? ` | ${proj.link}` : ""}</Text>
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
            <Text style={styles.sectionTitle}>Certifications</Text>
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
