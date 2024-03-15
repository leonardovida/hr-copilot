type VariantClassMap = {
  required: string;
  nicetohave: string;
  hardskill: string;
  softskill: string;
};

type SkillType = "required" | "nicetohave" | "hardskill" | "softskill";
type variantType =
  | "default"
  | "destructive"
  | "secondary"
  | "outline"
  | null
  | undefined;

export function getVariantBySkillType(skill: string): variantType {
  const skillKey: SkillType =
    (skill.replace(/\s+/g, "").toLowerCase() as SkillType) ||
    ("nicetohave" as SkillType);
  const variantClassMap: VariantClassMap = {
    required: "destructive",
    nicetohave: "",
    hardskill: "secondary",
    softskill: "outline",
  };
  return (variantClassMap[skillKey] as variantType) || null;
}
