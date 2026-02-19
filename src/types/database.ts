export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          external_id: string
          first_name: string
          last_name: string
          email: string | null
          date_of_birth: string | null
          code: string
          family_id: string
          avatar_url: string | null
          current_streak: number
          max_streak: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          external_id: string
          first_name: string
          last_name: string
          email?: string | null
          date_of_birth?: string | null
          code: string
          family_id: string
          avatar_url?: string | null
          current_streak?: number
          max_streak?: number
          last_activity_date?: string | null
        }
        Update: {
          first_name?: string
          last_name?: string
          email?: string | null
          avatar_url?: string | null
          current_streak?: number
          max_streak?: number
          last_activity_date?: string | null
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          slug: string
          author: string
          author_verified: boolean
          description: string | null
          cover_url: string | null
          average_rating: number
          total_ideas: number
          total_illuminated: number
          total_fires: number
          total_saves: number
          tags: Json
          is_published: boolean
          published_at: string | null
          created_at: string
        }
      }
      ideas: {
        Row: {
          id: string
          book_id: string
          title: string
          idea_number: number
          key_phrase: string
          video_url: string
          video_thumbnail_url: string | null
          duration_seconds: number
          audio_track_name: string | null
          intelligence_type: string
          illuminated_count: number
          fire_count: number
          save_count: number
          share_count: number
          view_count: number
          order_index: number
          created_at: string
        }
      }
      reactions: {
        Row: {
          id: string
          student_id: string
          idea_id: string
          type: string
          created_at: string
        }
        Insert: {
          student_id: string
          idea_id: string
          type: string
        }
      }
      bookmarks: {
        Row: {
          student_id: string
          idea_id: string
          created_at: string
        }
        Insert: {
          student_id: string
          idea_id: string
        }
      }
      book_progress: {
        Row: {
          id: string
          student_id: string
          book_id: string
          ideas_viewed: number
          ideas_completed: number
          progress_percent: number
          status: string
          started_at: string
          completed_at: string | null
          last_viewed_at: string
        }
      }
      idea_views: {
        Row: {
          id: string
          student_id: string
          idea_id: string
          watch_time_seconds: number
          completed: boolean
          last_position_seconds: number
          viewed_at: string
        }
        Insert: {
          student_id: string
          idea_id: string
          watch_time_seconds?: number
          completed?: boolean
          last_position_seconds?: number
        }
      }
      playlists: {
        Row: {
          id: string
          student_id: string
          name: string
          description: string | null
          cover_color: string
          is_public: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          name: string
          description?: string | null
          cover_color?: string
        }
      }
      playlist_items: {
        Row: {
          id: string
          playlist_id: string
          idea_id: string
          order_index: number
          added_at: string
        }
        Insert: {
          playlist_id: string
          idea_id: string
          order_index: number
        }
      }
      collections: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          cover_url: string | null
          gradient_from: string
          gradient_to: string
          order_index: number
          is_featured: boolean
          created_at: string
        }
      }
      reflections: {
        Row: {
          id: string
          student_id: string
          idea_id: string
          content: string
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          idea_id: string
          content: string
          is_private?: boolean
        }
      }
      search_history: {
        Row: {
          id: string
          student_id: string
          query: string
          searched_at: string
        }
        Insert: {
          student_id: string
          query: string
        }
      }
      student_intelligences: {
        Row: {
          student_id: string
          intelligence_code: string
          score: number
          ideas_consumed: number
        }
      }
    }
  }
}
