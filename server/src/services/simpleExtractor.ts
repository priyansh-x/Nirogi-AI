
export interface ExtractedFact {
    type: 'VITALS' | 'ALLERGY' | 'MEDICATION';
    value: string;
    description?: string;
    confidence: number;
}

export const extractFacts = (text: string): ExtractedFact[] => {
    const facts: ExtractedFact[] = [];

    // 1. Blood Pressure
    // Patterns: "BP: 120/80", "Blood Pressure 120/80", "120/80 mmHg"
    const bpRegex = /(?:BP|Blood Pressure)[:\s]+(\d{2,3}\/\d{2,3})/i;
    const bpMatch = text.match(bpRegex);
    if (bpMatch) {
        facts.push({
            type: 'VITALS',
            value: bpMatch[1],
            description: 'Blood Pressure',
            confidence: 0.95
        });
    }

    // 2. Heart Rate
    // Patterns: "HR: 72", "Heart Rate: 72 bpm", "Pulse 72"
    const hrRegex = /(?:HR|Heart Rate|Pulse)[:\s]+(\d{2,3})/i;
    const hrMatch = text.match(hrRegex);
    if (hrMatch) {
        facts.push({
            type: 'VITALS',
            value: `${hrMatch[1]} bpm`,
            description: 'Heart Rate',
            confidence: 0.95
        });
    }

    // 3. Weight
    // Patterns: "Weight: 70kg", "70 kg"
    const weightRegex = /(?:Weight)[:\s]+(\d{2,3}(?:\.\d)?\s?(?:kg|lbs))/i;
    const weightMatch = text.match(weightRegex);
    if (weightMatch) {
        facts.push({
            type: 'VITALS',
            value: weightMatch[1],
            description: 'Weight',
            confidence: 0.90
        });
    }

    // 4. Allergies
    // Section headers often denote lists
    // Look for "Allergies:" section until next newline or "Medications:"
    const allergiesSectionRegex = /Allergies:([\s\S]*?)(?:Medications:|Assessment:|Plan:|$)/i;
    const allergiesMatch = text.match(allergiesSectionRegex);
    if (allergiesMatch) {
        const allergyText = allergiesMatch[1].trim();
        if (allergyText && !allergyText.match(/none|nkda|no known/i)) {
            const items = allergyText.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 2);
            items.forEach(item => {
                facts.push({
                    type: 'ALLERGY',
                    value: item,
                    confidence: 0.85
                });
            });
        } else if (allergyText.match(/none|nkda|no known/i)) {
            facts.push({
                type: 'ALLERGY',
                value: 'NKDA',
                description: 'No Known Drug Allergies',
                confidence: 0.99
            });
        }
    }

    // 5. Medications
    // Look for "Medications:" or "Current Meds:"
    const medsSectionRegex = /(?:Medications|Current Meds|Rx):([\s\S]*?)(?:Allergies:|Assessment:|Plan:|$)/i;
    const medsMatch = text.match(medsSectionRegex);
    if (medsMatch) {
        const medsText = medsMatch[1].trim();
        if (medsText && !medsText.match(/none/i)) {
            // Split by newline or comma typically
            const items = medsText.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 2);
            items.forEach(item => {
                facts.push({
                    type: 'MEDICATION',
                    value: item,
                    confidence: 0.85
                });
            });
        }
    }

    return facts;
};
