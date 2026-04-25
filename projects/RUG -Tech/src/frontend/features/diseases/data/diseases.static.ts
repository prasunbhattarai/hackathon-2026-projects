import type { PriorityTier } from '@/types/case.types'

export interface DiseaseStage {
  name: string
  description: string
  tier: PriorityTier
}

export interface DiseaseInfo {
  slug: string
  name: string
  shortDescription: string
  iconName: string
  accentColor: string
  overview: string
  stages: DiseaseStage[]
  symptoms: string[]
  riskFactors: string[]
  treatments: string[]
  aiCapability: string
  prevalence: string
}

export const diseases: DiseaseInfo[] = [
  {
    slug: 'diabetic-retinopathy',
    name: 'Diabetic Retinopathy',
    shortDescription:
      'A diabetes complication that affects the blood vessels in the retina, potentially leading to vision loss if untreated.',
    iconName: 'Eye',
    accentColor: 'var(--sev-critical)',
    overview:
      'Diabetic retinopathy (DR) is the most common microvascular complication of diabetes mellitus and the leading cause of preventable blindness in working-age adults worldwide. It occurs when chronically elevated blood sugar damages the tiny blood vessels in the retina — the light-sensitive tissue at the back of the eye. In its early stages, DR may cause no symptoms at all, making routine screening essential for diabetic patients. As the disease progresses, weakened blood vessels may leak fluid or blood into the retina, or abnormal new vessels may grow on the retinal surface (neovascularization), both of which can severely impair vision.',
    stages: [
      {
        name: 'No DR',
        description:
          'No visible retinal abnormalities. Retinal vasculature appears healthy with no microaneurysms, hemorrhages, or exudates.',
        tier: 'low',
      },
      {
        name: 'Mild NPDR',
        description:
          'Presence of at least one microaneurysm. Early damage to small retinal blood vessels with minimal clinical significance.',
        tier: 'low',
      },
      {
        name: 'Moderate NPDR',
        description:
          'Multiple microaneurysms, dot/blot hemorrhages, hard exudates, or cotton-wool spots in at least one quadrant. Retinal ischemia is developing.',
        tier: 'medium',
      },
      {
        name: 'Severe NPDR',
        description:
          'Extensive retinal hemorrhages (≥20 per quadrant), venous beading, or intraretinal microvascular abnormalities (IRMA). High risk of progressing to PDR within 12 months.',
        tier: 'high',
      },
      {
        name: 'Proliferative DR (PDR)',
        description:
          'Neovascularization of the disc or elsewhere on the retina, with high risk of vitreous hemorrhage, tractional retinal detachment, and severe vision loss. Requires urgent intervention.',
        tier: 'critical',
      },
    ],
    symptoms: [
      'Blurred or fluctuating vision',
      'Dark or empty areas in the visual field',
      'Difficulty perceiving colors',
      'Floaters (spots or dark strings)',
      'Vision loss (advanced stages)',
      'Often asymptomatic in early stages',
    ],
    riskFactors: [
      'Duration of diabetes (primary factor)',
      'Poor glycemic control (high HbA1c)',
      'Hypertension',
      'Dyslipidemia',
      'Pregnancy',
      'Smoking',
      'Genetic predisposition',
    ],
    treatments: [
      'Optimized blood sugar, blood pressure, and lipid control',
      'Anti-VEGF intravitreal injections (bevacizumab, ranibizumab, aflibercept)',
      'Panretinal photocoagulation (PRP) laser therapy for PDR',
      'Focal/grid laser for clinically significant macular edema',
      'Vitrectomy surgery for non-clearing vitreous hemorrhage or tractional detachment',
      'Regular ophthalmic screening every 6–12 months',
    ],
    aiCapability:
      'Fundus AI detects and classifies diabetic retinopathy into 5 grades (None, Mild, Moderate, Severe, PDR) using deep learning analysis of fundus photographs. The system identifies microaneurysms, hemorrhages, exudates, and neovascularization patterns with clinical-grade accuracy.',
    prevalence:
      'Affects approximately 1 in 3 people with diabetes. DR is the leading cause of blindness in adults aged 20–74.',
  },
  {
    slug: 'glaucoma',
    name: 'Glaucoma',
    shortDescription:
      'A group of eye conditions that damage the optic nerve, often associated with elevated intraocular pressure.',
    iconName: 'CircleDot',
    accentColor: 'var(--sev-high)',
    overview:
      'Glaucoma is a progressive optic neuropathy characterized by structural damage to the optic nerve head and corresponding visual field loss. It is the leading cause of irreversible blindness globally. The most common form, primary open-angle glaucoma (POAG), develops gradually and painlessly. Elevated intraocular pressure (IOP) is the most significant modifiable risk factor, although normal-tension glaucoma can occur at statistically normal IOP levels. Early detection through fundus imaging can reveal characteristic changes in the optic disc, including increased cup-to-disc ratio, rim thinning, and nerve fiber layer defects.',
    stages: [
      {
        name: 'Low Risk',
        description:
          'Normal optic disc appearance with healthy neuroretinal rim and cup-to-disc ratio. No visual field defects.',
        tier: 'low',
      },
      {
        name: 'Suspect / Moderate Risk',
        description:
          'Borderline cup-to-disc ratio, asymmetry between eyes, or early nerve fiber layer thinning. Requires monitoring.',
        tier: 'medium',
      },
      {
        name: 'High Risk',
        description:
          'Significant optic disc cupping, notching, or disc hemorrhage. Visual field testing recommended urgently.',
        tier: 'high',
      },
    ],
    symptoms: [
      'Usually asymptomatic until advanced stages',
      'Gradual loss of peripheral (side) vision',
      'Tunnel vision in advanced cases',
      'Acute angle-closure: sudden eye pain, headache, halos, nausea',
      'Blurred vision in affected areas',
    ],
    riskFactors: [
      'Elevated intraocular pressure',
      'Age over 60 years',
      'Family history of glaucoma',
      'African, Hispanic, or Asian ancestry',
      'Myopia (nearsightedness)',
      'Thin central cornea',
      'History of eye injury',
    ],
    treatments: [
      'Topical IOP-lowering eye drops (prostaglandin analogs, beta-blockers, alpha-agonists)',
      'Selective laser trabeculoplasty (SLT)',
      'Minimally invasive glaucoma surgery (MIGS)',
      'Trabeculectomy or tube shunt surgery for refractory cases',
      'Regular IOP monitoring and visual field testing',
      'Neuroprotective strategies (under research)',
    ],
    aiCapability:
      'Fundus AI evaluates the optic disc morphology to assess glaucoma risk. It analyzes cup-to-disc ratio, neuroretinal rim integrity, disc hemorrhages, and peripapillary atrophy patterns to classify risk as Low, Medium, or High.',
    prevalence:
      'Affects over 80 million people worldwide. Expected to reach 112 million by 2040.',
  },
  {
    slug: 'hypertensive-retinopathy',
    name: 'Hypertensive Retinopathy',
    shortDescription:
      'Retinal vascular damage caused by chronically elevated blood pressure, serving as a window into systemic vascular health.',
    iconName: 'Heart',
    accentColor: 'var(--sev-medium)',
    overview:
      'Hypertensive retinopathy (HR) refers to the spectrum of retinal vascular changes caused by sustained systemic hypertension. The retinal vasculature is uniquely accessible for direct visualization and serves as an indicator of microvascular damage throughout the body, including the brain, heart, and kidneys. Funduscopic findings progress from mild arteriolar narrowing and arteriovenous nicking to more severe manifestations like flame-shaped hemorrhages, cotton-wool spots, hard exudates, and in malignant hypertension, optic disc edema. Detection of hypertensive retinopathy has significant prognostic implications for cardiovascular morbidity and mortality.',
    stages: [
      {
        name: 'Low Risk',
        description:
          'Normal retinal vasculature or mild, generalized arteriolar narrowing. No hemorrhages or exudates.',
        tier: 'low',
      },
      {
        name: 'Moderate Risk',
        description:
          'Focal arteriolar narrowing, arteriovenous nicking, or early vascular changes consistent with chronic hypertension.',
        tier: 'medium',
      },
      {
        name: 'High Risk',
        description:
          'Flame hemorrhages, cotton-wool spots, hard exudates, or signs of retinal ischemia indicating poorly controlled or accelerated hypertension.',
        tier: 'high',
      },
    ],
    symptoms: [
      'Usually asymptomatic in mild to moderate stages',
      'Blurred vision or visual disturbance',
      'Headaches (associated with hypertensive crisis)',
      'Sudden vision loss in severe cases',
      'Double vision in rare cases',
    ],
    riskFactors: [
      'Chronic systemic hypertension',
      'Poor blood pressure medication adherence',
      'Obesity and sedentary lifestyle',
      'High sodium diet',
      'Diabetes mellitus (often co-existing)',
      'Smoking',
      'Chronic kidney disease',
    ],
    treatments: [
      'Aggressive blood pressure control to target levels',
      'Antihypertensive medications (ACE inhibitors, ARBs, calcium channel blockers)',
      'Lifestyle modifications: diet, exercise, sodium restriction, weight management',
      'Treatment of underlying cause (renal artery stenosis, endocrine disorders)',
      'Regular fundus screening for disease progression',
      'Cardiovascular risk assessment and management',
    ],
    aiCapability:
      'Fundus AI analyzes retinal vessel morphology to detect signs of hypertensive retinopathy. It evaluates arteriolar narrowing, arteriovenous changes, hemorrhage patterns, and exudates to classify risk as Low, Medium, or High.',
    prevalence:
      'Found in approximately 2–17% of non-diabetic adults, with higher prevalence in populations with poorly controlled hypertension.',
  },
]

export function getDiseaseBySlug(slug: string): DiseaseInfo | undefined {
  return diseases.find((d) => d.slug === slug)
}
