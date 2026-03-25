// ===== Supabase 클라이언트 초기화 =====
// Supabase: 백엔드(데이터베이스·로그인)를 제공하는 서비스
// CDN으로 불러온 supabase 객체를 사용해 클라이언트를 생성함

const SUPABASE_URL = 'https://wkhxfidkzzmvbkbquclu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraHhmaWRrenptdmJrYnF1Y2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzA3MjYsImV4cCI6MjA5MDAwNjcyNn0.Vn7X1Mpt8EyhM1oB6nbHtwRXyzmFHy0Q2E-Fqu_iakA';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
