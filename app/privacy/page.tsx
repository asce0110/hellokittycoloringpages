import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Database, Lock, Cookie, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - AI Kitty Creator",
  description: "Privacy Policy for AI Kitty Creator - How we collect, use, and protect your personal information.",
  keywords: "privacy policy, data protection, AI Kitty Creator, personal information, GDPR, CCPA"
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
        <Badge variant="outline" className="mt-4">
          Last Updated: January 1, 2025
        </Badge>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              1. Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              AI Kitty Creator ("we", "our", or "us") operates the AI Kitty Creator website and platform. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
            </p>
            <p>
              We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              2. Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <p className="mb-2">When you create an account or use our services, we may collect:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Email address (for account creation and communication)</li>
                <li>Username or display name</li>
                <li>Profile preferences and settings</li>
                <li>AI generation history and preferences</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Usage Information</h4>
              <p className="mb-2">We automatically collect certain information about your use of our platform:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Pages visited and time spent on our platform</li>
                <li>Coloring pages downloaded or viewed</li>
                <li>AI generation requests and parameters</li>
                <li>Device information and browser type</li>
                <li>IP address and general location data</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Technical Information</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Cookies and similar tracking technologies</li>
                <li>Log files and server data</li>
                <li>Analytics data for service improvement</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              3. How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We use the collected information for various purposes:</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Provision</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Providing access to our coloring page library</li>
                  <li>Generating AI-powered coloring pages based on your requests</li>
                  <li>Managing your account and user preferences</li>
                  <li>Processing downloads and print requests</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Service Improvement</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Analyzing usage patterns to improve our platform</li>
                  <li>Training and improving our AI generation algorithms</li>
                  <li>Developing new features and content</li>
                  <li>Conducting research and analytics</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Communication</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Sending important service updates and notifications</li>
                  <li>Responding to your inquiries and support requests</li>
                  <li>Sending optional newsletters and promotional content (with consent)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Generation and Data Processing */}
        <Card>
          <CardHeader>
            <CardTitle>4. AI Generation and Data Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">AI Training Data</h4>
              <p>
                We may use anonymized generation requests and user interactions to improve our AI models. Personal identifiers are removed from this data.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Content Generation</h4>
              <p>
                Your AI generation prompts are processed to create coloring pages. We may store these requests to improve our service but do not share specific prompts with third parties.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies and Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              5. Cookies and Tracking Technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Essential Cookies</h4>
              <p>
                We use essential cookies to maintain your session, remember your preferences, and ensure platform functionality. These cannot be disabled without affecting service operation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Analytics Cookies</h4>
              <p>
                We use analytics cookies to understand how users interact with our platform. This helps us improve user experience and platform performance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Managing Cookies</h4>
              <p>
                You can control cookie settings through your browser preferences. Note that disabling certain cookies may limit platform functionality.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing and Disclosure */}
        <Card>
          <CardHeader>
            <CardTitle>6. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Providers</h4>
                <p>
                  We may employ trusted third-party companies to facilitate our Service, such as hosting providers, analytics services, and payment processors. These parties have access to your data only to perform specific tasks on our behalf and are obligated not to disclose or use it for other purposes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Legal Requirements</h4>
                <p>
                  We may disclose your information if required by law or if we believe that such action is necessary to comply with legal obligations, protect our rights, or ensure user safety.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle>7. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <div>
              <h4 className="font-semibold mb-2">Security Measures Include:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication systems</li>
                <li>Secure cloud infrastructure and hosting</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              While we strive to use commercially acceptable means to protect your data, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>8. Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Access Rights</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Request a copy of your personal data</li>
                  <li>View what information we have collected</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Control Rights</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Communication Rights</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Opt out of marketing communications</li>
                  <li>Control email preferences</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Data Portability</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Request data in a portable format</li>
                  <li>Transfer data to another service</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>9. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
            </p>
            
            <div className="space-y-2">
              <p><strong>Account Data:</strong> Retained while your account is active</p>
              <p><strong>Generation History:</strong> Retained for service improvement (anonymized after 2 years)</p>
              <p><strong>Analytics Data:</strong> Aggregated and anonymized, retained for 3 years</p>
              <p><strong>Communication Data:</strong> Retained as necessary for legal compliance</p>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>10. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our Service is designed to be family-friendly but is not specifically directed at children under 13. We do not knowingly collect personally identifiable information from children under 13.
            </p>
            <p>
              If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so we can take necessary action.
            </p>
          </CardContent>
        </Card>

        {/* International Data Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>11. International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle>12. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              13. Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>AI Kitty Creator Privacy Team</strong></p>
              <p>Email: privacy@aikittycreator.com</p>
              <p>Data Protection Officer: dpo@aikittycreator.com</p>
              <p>Address: [Your Business Address]</p>
            </div>
            <p className="text-sm text-muted-foreground">
              We aim to respond to all privacy-related inquiries within 30 days.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>
          This privacy policy was last updated on January 1, 2025. By using AI Kitty Creator, you acknowledge that you have read and understood this policy.
        </p>
      </div>
    </div>
  )
}