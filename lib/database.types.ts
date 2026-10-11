export type UserRole = "admin" | "user";
export type AccountStatus = "active" | "suspended";
export type VisitType = "installation" | "follow_up" | "issue_fix" | "other";
export type RequestStatus = "pending" | "approved" | "rejected";
export type RequestTarget = "clients" | "visits";
export type PendingStatus = "none" | "open" | "done";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  email: string | null;
  status: AccountStatus;
  created_at: string;
};

export type Client = {
  id: string;
  company_id: string;
  name: string;
  contact_name: string | null;
  contact_phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  directions_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Visit = {
  id: string;
  client_id: string;
  user_id: string | null;
  visit_type: VisitType;
  visited_at: string;
  work_done: string;
  pending: string;
  notes: string | null;
  pending_status: PendingStatus;
  pending_done_by: string | null;
  pending_done_at: string | null;
  pending_done_note: string | null;
  pending_done_visit_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PendingItem = {
  visit_id: string;
  client_id: string;
  client_name: string;
  company_id: string;
  pending: string;
  visited_at: string;
  reported_by: string | null;
  reported_by_name: string | null;
  pending_status: PendingStatus;
  pending_done_by: string | null;
  done_by_name: string | null;
  pending_done_at: string | null;
  pending_done_note: string | null;
  pending_done_visit_id: string | null;
};

export type EditRequest = {
  id: string;
  target_table: RequestTarget;
  target_id: string;
  requested_by: string | null;
  changes: Record<string, string | number | null>;
  reason: string | null;
  status: RequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
};

export type Setting = {
  key: string;
  value: string;
  updated_at: string;
};

type Insertable<T, Omitted extends keyof T, Optional extends keyof T = never> = Omit<
  T,
  Omitted | Optional
> &
  Partial<Pick<T, Optional>>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Insertable<Profile, "created_at", "full_name" | "role" | "email" | "status">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: Insertable<
          Client,
          "id" | "created_at" | "updated_at",
          "contact_name" | "contact_phone" | "address" | "lat" | "lng" | "directions_note"
        >;
        Update: Partial<Client>;
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      visits: {
        Row: Visit;
        Insert: Insertable<
          Visit,
          | "id"
          | "created_at"
          | "updated_at"
          | "pending_status"
          | "pending_done_by"
          | "pending_done_at"
          | "pending_done_note"
          | "pending_done_visit_id",
          "visit_type" | "visited_at" | "work_done" | "pending" | "notes"
        >;
        Update: Partial<Visit>;
        Relationships: [
          {
            foreignKeyName: "visits_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visits_pending_done_by_fkey";
            columns: ["pending_done_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      edit_requests: {
        Row: EditRequest;
        Insert: Insertable<
          EditRequest,
          "id" | "created_at" | "reviewed_by" | "reviewed_at" | "review_note",
          "reason" | "status"
        >;
        Update: Partial<EditRequest>;
        Relationships: [
          {
            foreignKeyName: "edit_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: Setting;
        Insert: Insertable<Setting, "updated_at">;
        Update: Partial<Setting>;
        Relationships: [];
      };
    };
    Views: {
      pending_items: {
        Row: PendingItem;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      review_edit_request: {
        Args: { p_request_id: string; p_approve: boolean; p_note?: string | null };
        Returns: undefined;
      };
      set_pending_status: {
        Args: {
          p_visit_id: string;
          p_done: boolean;
          p_note?: string | null;
          p_resolving_visit_id?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      visit_type: VisitType;
      request_status: RequestStatus;
      request_target: RequestTarget;
      pending_status: PendingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
