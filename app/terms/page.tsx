import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Scale, FileText, Shield, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service - AI Kitty Creator",
  description: "Terms of Service for AI Kitty Creator - AI-powered Hello Kitty coloring page generator and library platform.",
  keywords: "terms of service, legal, AI Kitty Creator, Hello Kitty coloring pages, AI art generator"
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Scale className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Please read these terms carefully before using AI Kitty Creator
        </p>
        <Badge variant="outline" className="mt-4">
          Effective Date: January 1, 2025
        </Badge>
      </div>

      <div className="space-y-8">
        {/* Agreement Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              1. Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing and using AI Kitty Creator ("Service", "Platform", "Website"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <p>
              AI Kitty Creator is a platform that provides AI-generated Hello Kitty coloring pages and a curated library of existing coloring content for personal use.
            </p>
          </CardContent>
        </Card>

        {/* Use License */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              2. Use License
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Use Permission</h4>
              <p>
                We grant you a personal, non-commercial license to download, print, and color the content available on our platform for:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Personal entertainment and relaxation</li>
                <li>Educational purposes in non-commercial settings</li>
                <li>Family activities and home use</li>
                <li>Personal art projects and crafts</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2 text-red-600">Restrictions</h4>
              <p>Under this license you may NOT:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Use content for commercial purposes or profit</li>
                <li>Modify or create derivative works for redistribution</li>
                <li>Remove copyright notices or attribution</li>
                <li>Redistribute, sell, or sublicense the content</li>
                <li>Use our AI service to generate inappropriate content</li>
                <li>Attempt to reverse engineer our AI systems</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* AI Generation Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              3. AI Generation Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Service Availability</h4>
              <p>
                Our AI generation service is provided on an "as available" basis. We strive for high uptime but cannot guarantee uninterrupted service.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Content Guidelines</h4>
              <p>
                When using our AI generation service, you agree to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Only request family-friendly, appropriate content</li>
                <li>Respect intellectual property rights</li>
                <li>Not attempt to generate offensive or inappropriate material</li>
                <li>Use the service responsibly and within fair usage limits</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Generated Content Ownership</h4>
              <p>
                Content generated through our AI service is provided for your personal use. We retain the right to store anonymized generation data for service improvement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>4. User Accounts and Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              When creating an account, you agree to provide accurate information and maintain the security of your account credentials.
            </p>
            <p>
              You are responsible for all activities that occur under your account and agree to notify us immediately of any unauthorized use.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>5. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of AI Kitty Creator and its licensors.
            </p>
            <p>
              Hello Kitty and related characters are trademarks of Sanrio Company, Ltd. Our platform operates under fair use principles for educational and personal entertainment purposes.
            </p>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card>
          <CardHeader>
            <CardTitle>6. Privacy and Data Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
            <p>
              We collect minimal data necessary to provide our services and improve user experience. All data handling follows applicable privacy laws.
            </p>
          </CardContent>
        </Card>

        {/* Service Modifications */}
        <Card>
          <CardHeader>
            <CardTitle>7. Service Modifications and Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to modify or discontinue the Service at any time, with or without notice. We shall not be liable to you or any third party for any modification or discontinuance.
            </p>
            <p>
              We may terminate or suspend your access immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>8. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The information on this platform is provided on an "as is" basis. To the fullest extent permitted by law, AI Kitty Creator excludes all representations, warranties, or conditions relating to our platform and the use of our platform.
            </p>
            <p>
              Nothing in these Terms shall exclude or limit our liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>9. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through prominent notices on our platform.
            </p>
            <p>
              Your continued use of the Service after changes constitute acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>10. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>AI Kitty Creator Support</strong></p>
              <p>Email: legal@aikittycreator.com</p>
              <p>Address: [Your Business Address]</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>
          These terms were last updated on January 1, 2025. By using AI Kitty Creator, you acknowledge that you have read and understood these terms.
        </p>
      </div>
    </div>
  )
}