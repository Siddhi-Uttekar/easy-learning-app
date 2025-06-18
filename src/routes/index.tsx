import { createFileRoute } from '@tanstack/react-router'
import '../App.css'
import { Button } from "@/components/ui/button"
// import "../styles/global.css"

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="App">
      <h1 className='bg-amber-400  '>helo</h1> <Button variant="destructive">Click me</Button>
       <div className="flex min-h-svh flex-col items-center justify-center">
      <Button variant="destructive">Click me</Button>
    </div>
    </div>
  )
}
