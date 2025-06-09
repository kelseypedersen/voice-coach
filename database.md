```mermaid
erDiagram
    USERS {
      uuid id PK
      text clerk_id
      text guest_id
      text email
      boolean is_pro
      timestamp created_at
      timestamp updated_at
    }
    USER_UPLOADS {
      uuid id PK
      integer upload_count
      boolean is_pro
      timestamp created_at
      timestamp updated_at
      uuid user_id FK
    }
    UPLOAD_HISTORY {
      uuid id PK
      text file_name
      timestamp analyzed_at
      jsonb analysis_result
      text audio_url
      uuid user_id FK
    }

    USERS ||--o{ USER_UPLOADS : "has"
    USERS ||--o{ UPLOAD_HISTORY : "has"