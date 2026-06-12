import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "../types";

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.5, color: "#222" },
  header: { marginBottom: 20, alignItems: "center" },
  name: { fontSize: 20, fontWeight: "bold", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  divider: { width: 60, height: 1, backgroundColor: "#222", marginVertical: 6 },
  contact: { fontSize: 9, color: "#555" },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, color: "#222" },
  summary: { fontSize: 10, lineHeight: 1.6, color: "#444" },
  skills: { fontSize: 10, lineHeight: 1.6, color: "#444" },
  expItem: { marginBottom: 10 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  expRole: { fontSize: 10, fontWeight: "bold" },
  expDates: { fontSize: 9, color: "#888" },
  expCompany: { fontSize: 10, color: "#555", marginBottom: 3, fontStyle: "italic" },
  bullet: { fontSize: 10, marginLeft: 10, marginBottom: 2 },
  eduItem: { marginBottom: 6 },
  eduHeader: { flexDirection: "row", justifyContent: "space-between" },
  eduDegree: { fontSize: 10, fontWeight: "bold" },
  eduDate: { fontSize: 9, color: "#888" },
  eduSchool: { fontSize: 10, color: "#555" },
  projItem: { marginBottom: 6 },
  projName: { fontSize: 10, fontWeight: "bold" },
  projDesc: { fontSize: 10, color: "#444", marginTop: 1 },
  projTech: { fontSize: 9, color: "#888", marginTop: 1 },
  certItem: { marginBottom: 3 },
  certText: { fontSize: 10 },
});

export function Minimal({ data }: { data: ResumeData }) {
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
          <View style={styles.divider} />
          <Text style={styles.contact}>{contactParts.join("   \u00B7   ")}</Text>
        </View>

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skills}>{data.skills.join("  \u00B7  ")}</Text>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expRole}>{exp.role}</Text>
                  <Text style={styles.expDates}>{exp.startDate} \u2013 {exp.endDate}</Text>
                </View>
                <Text style={styles.expCompany}>{exp.company}</Text>
                {(exp.bulletPoints || []).map((bp, j) => (
                  <Text key={j} style={styles.bullet}>{"\u2013"} {bp}</Text>
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
                <View style={styles.eduHeader}>
                  <Text style={styles.eduDegree}>{edu.degree} in {edu.field}</Text>
                  <Text style={styles.eduDate}>{edu.startDate} \u2013 {edu.endDate}</Text>
                </View>
                <Text style={styles.eduSchool}>{edu.institution}{edu.gpa ? ` \u2014 GPA: ${edu.gpa}` : ""}</Text>
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, i) => (
              <View key={i} style={styles.projItem}>
                <Text style={styles.projName}>{proj.name}</Text>
                <Text style={styles.projDesc}>{proj.description}</Text>
                {proj.technologies.length > 0 && (
                  <Text style={styles.projTech}>{proj.technologies.join(", ")}</Text>
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
                <Text style={styles.certText}>{cert.name} \u2014 {cert.issuer} ({cert.date})</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
