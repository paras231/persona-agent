import { Route, Routes } from 'react-router-dom'
import ChatApp from './ChatApp'
import Landing from './components/Landing'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<ChatApp />} />
    </Routes>
  )
}
