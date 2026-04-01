import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <p className="text-8xl font-bold text-primary/20">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mt-4">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500 mt-2">요청하신 페이지가 존재하지 않습니다.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="btn-primary mt-6"
      >
        대시보드로 돌아가기
      </button>
    </div>
  )
}
