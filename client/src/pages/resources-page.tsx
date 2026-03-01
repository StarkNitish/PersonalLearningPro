import { useState } from "react";
import { useLocation } from "wouter";
import { AchieversBookPanel } from "@/components/test/achievers-book-panel";
import { ArrowLeft, BookOpen, Brain, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Re-using mockAchieversData to show in the panel
const mockAchieversData = {
    summary: `
# Chapter 5: Electromagnetism

### Key Concepts
- **Magnetic Flux ($\\Phi_B$)**: $\\Phi_B = B \\cdot A \\cdot \\cos(\\theta)$
- **Faraday's Law of Induction**: $\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$
- **Lenz's Law**: The direction of the induced current opposes the change in magnetic flux that produced it.

### Important Real-World Examples
1. **Generators**: Convert mechanical energy into electrical energy using electromagnetic induction.
2. **Transformers**: Step up or step down AC voltage by mutual induction.
  `,
    pyqs: [
        {
            year: 2023,
            board: "CBSE Set A",
            question: "Why can't a transformer be used with a DC source?",
            answer: "A transformer works on the principle of mutual induction which requires a changing magnetic flux. A DC source produces a constant magnetic field, so there is no changing flux, and thus no induced EMF."
        },
        {
            year: 2022,
            board: "ICSE",
            question: "State Lenz's Law.",
            answer: "Lenz's Law states that the current induced in a circuit due to a change in a magnetic field is directed to oppose the change in flux and to exert a mechanical force which opposes the motion."
        }
    ]
};

const resources = [
    {
        title: "Chapter 5: Electromagnetism - Quick Revision",
        subject: "Physics",
        type: "Interactive Note",
        description: "Read the full Achievers Book summary and practice Previous Year Questions.",
        icon: <BookOpen className="h-6 w-6 text-blue-500" />,
        gradient: "from-blue-500/10 to-indigo-600/10",
        action: "Read"
    },
    {
        title: "Calculus Fundamentals",
        subject: "Mathematics",
        type: "PDF Guide",
        description: "Master integration and differentiation basics.",
        icon: <Download className="h-6 w-6 text-amber-500" />,
        gradient: "from-amber-500/10 to-orange-600/10",
        action: "Download"
    },
    {
        title: "Organic Chemistry Reactions Map",
        subject: "Chemistry",
        type: "Mind Map",
        description: "A complete visual guide to all named reactions.",
        icon: <Brain className="h-6 w-6 text-emerald-500" />,
        gradient: "from-emerald-500/10 to-teal-600/10",
        action: "View"
    }
];

export default function ResourcesPage() {
    const [, setLocation] = useLocation();
    const [isBookOpen, setIsBookOpen] = useState(false);

    return (
        <>
            <PageHeader
                title="Learning Resources"
                subtitle="Access study materials, e-books, and curated learning content."
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Resources" },
                ]}
            >
                <Button variant="outline" onClick={() => setLocation("/")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </PageHeader>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search resources by topic or subject..." className="pl-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {resources.map((res, i) => (
                    <Card key={i} className="group hover:-translate-y-1 hover:shadow-md transition-all duration-250 flex flex-col h-full">
                        <CardContent className="p-6 flex flex-col h-full flex-grow">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${res.gradient} shadow-sm`}>
                                    {res.icon}
                                </div>
                                <Badge variant="secondary">{res.subject}</Badge>
                            </div>

                            <h3 className="font-bold text-lg mb-2">{res.title}</h3>
                            <p className="text-sm text-muted-foreground mb-6 flex-grow">{res.description}</p>

                            <Button
                                className="w-full mt-auto"
                                variant={res.action === "Read" ? "default" : "outline"}
                                onClick={() => res.action === "Read" ? setIsBookOpen(true) : undefined}
                            >
                                {res.action}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AchieversBookPanel
                summary={mockAchieversData.summary}
                pyqs={mockAchieversData.pyqs}
                isOpen={isBookOpen}
                onChange={setIsBookOpen}
            />

            {/* Overlay for mobile when book is open */}
            {isBookOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[50]"
                    onClick={() => setIsBookOpen(false)}
                />
            )}
        </>
    );
}
