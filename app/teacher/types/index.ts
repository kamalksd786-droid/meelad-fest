export interface Student {
  id: number;
  admission_no: string;
  student_name: string;
  class: string;
  category: string;
  team: string;
}

export interface Programme {
  id: number;
  programme_code: string;
  programme_name: string;
  programme_type: "Stage" | "Off Stage" | "Group" | "General";
  participant_type: "Single" | "Group";
  category: string;
  is_active: boolean;
}

export interface Registration {
  id: number;
  student_id: number;
  programme_id: number;
  admission_no: string;
  student_name: string;
  class: string;
  team: string;
  category: string;
  programme_name: string;
  programme_code: string;
  programme_type: string;
}