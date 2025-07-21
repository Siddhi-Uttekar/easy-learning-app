
// import { useState } from 'react'
// import { Route } from './route'
// import { MathJaxContext, MathJax } from 'better-react-mathjax'
// import { Button } from '@/components/ui/button'
// import { toast } from 'sonner'

// type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked'

// export default function AttemptPage() {
//   const { attemptId } = Route.useParams()
//   const test = Route.useLoaderData()

//   // Question state tracking
//   const totalQuestions = test.questions.length
//   const [current, setCurrent] = useState(0)
//   // { [questionId]: optionId }
//   const [answers, setAnswers] = useState<{ [questionId: number]: string }>({})
//   // { [questionId]: 'not_visited' | 'not_answered' | 'answered' | 'marked' }
//   const [status, setStatus] = useState<{ [questionId: number]: QuestionStatus }>(() => {
//     const map: { [questionId: number]: QuestionStatus } = {}
//     test.questions.forEach((q: any) => (map[q.id] = 'not_visited'))
//     return map
//   })

//   // Navigates to a question and sets status if needed
//   const goToQuestion = (idx: number) => {
//     const qId = test.questions[idx].id
//     setCurrent(idx)
//     setStatus((prev) => ({
//       ...prev,
//       [qId]: prev[qId] === 'not_visited' ? 'not_answered' : prev[qId],
//     }))
//   }

//   // Option select logic
//   const handleOptionSelect = (questionId: number, optionId: string) => {
//     setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
//     setStatus((prev) => ({
//       ...prev,
//       [questionId]: 'answered',
//     }))
//   }

//   // Mark for review logic
//   const markForReview = () => {
//     const qId = test.questions[current].id
//     setStatus((prev) => ({
//       ...prev,
//       [qId]: 'marked',
//     }))
//     // Move to next question if possible
//     if (current < totalQuestions - 1) {
//       goToQuestion(current + 1)
//     }
//   }

//   // Clear response logic
//   const clearResponse = () => {
//     const qId = test.questions[current].id
//     setAnswers((prev) => {
//       const { [qId]: _, ...rest } = prev
//       return rest
//     })
//     setStatus((prev) => ({
//       ...prev,
//       [qId]: 'not_answered',
//     }))
//   }

//   // Submission logic
//   const submitTest = async () => {
//     const payload = {
//       answers: Object.entries(answers).map(([qid, oid]) => ({
//         objectiveQuestionId: Number(qid),
//         selectedOptionOriginalId: oid,
//       })),
//     }
//     try {
//       await fetch(`/tests/attempts/${attemptId}/objective-answers`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       })
//       toast.success('Test Submitted Successfully')
//       // Optionally: Route.navigate('/dashboard/tests')
//     } catch {
//       toast.error('Failed to submit test')
//     }
//   }

//   // Button color based on status
//   function getButtonVariant(idx: number) {
//     const qId = test.questions[idx].id
//     switch (status[qId]) {
//       case 'answered':
//         return 'success' // 🟩
//       case 'not_answered':
//         return 'danger' // 🟥
//       case 'marked':
//         return 'warning' // 🟨
//       case 'not_visited':
//       default:
//         return 'default' // ⚪
//     }
//   }

//   // MathJax config
//   const mathJaxConfig = {
//     loader: { load: ['[tex]/ams'] },
//     tex: {
//       packages: { '[+]': ['ams'] },
//       inlineMath: [['$', '$'], ['\\(', '\\)']],
//       displayMath: [['$$', '$$'], ['\\[', '\\]']],
//     },
//   }

//   // Current question
//   const question = test.questions[current]

//   return (
//     <MathJaxContext config={mathJaxConfig}>
//       <div className="p-6">
//         <h1 className="text-3xl font-bold">{test.title}</h1>
//         <p className="text-gray-600">{test.description}</p>
//         <div className="mt-2 space-x-4 text-sm text-gray-700">
//           <span>⏱️ Time Limit: {test.timeLimit} mins</span>
//           <span>🎯 Total Marks: {test.totalMarks}</span>
//         </div>

//         {/* Question Navigation Grid */}
//         <div className="my-6">
//          <div className="grid grid-cols-5 gap-2">
//   {[...Array(totalQuestions)].map((_, idx) => (
//     <Button
//       key={idx}
//       variant="outline"
//       onClick={() => goToQuestion(idx)}
//       className="h-10 w-10 rounded-full text-sm"
//     >
//       {idx + 1}
//     </Button>
//   ))}
// </div>

//           <div className="mt-2 flex gap-4 text-xs">
//             <span>🟩 Answered</span>
//             <span>🟥 Not Answered</span>
//             <span>🟨 Marked for Review</span>
//             <span>⚪ Not Visited</span>
//           </div>
//         </div>

//         {/* Only show one question at a time */}
//         <div className="mt-8">
//           <QuestionCard
//             question={question}
//             index={current}
//             selectedOption={answers[question.id]}
//             onSelect={handleOptionSelect}
//           />

//           {/* Mark/Clear/Submit controls */}
//           <div className="mt-4 flex gap-4">
//             <Button onClick={markForReview}>Mark for Review & Next</Button>
//             <Button onClick={clearResponse}>Clear Response</Button>
//             <Button onClick={submitTest} variant="outline">
//               Submit
//             </Button>
//           </div>
//         </div>
//       </div>
//     </MathJaxContext>
//   )
// }

// function QuestionCard({
//   question,
//   index,
//   selectedOption,
//   onSelect,
// }: {
//   question: any
//   index: number
//   selectedOption?: string
//   onSelect: (questionId: number, optionId: string) => void
// }) {
//   return (
//     <div className="p-4 border rounded-md shadow-sm bg-white">
//       <div className="mb-2 font-semibold">
//         Q{index + 1}.{' '}
//         <MathJax dynamic>
//           <span dangerouslySetInnerHTML={{ __html: question.questionText }} />
//         </MathJax>
//       </div>

//       <div className="pl-4 space-y-2">
//         {question.options.map((option: any) => (
//           <label
//             key={option.id}
//             className={`flex items-start gap-2 p-2 border rounded cursor-pointer ${
//               selectedOption === option.id ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'
//             }`}
//           >
//             <input
//               type="radio"
//               name={`question-${question.id}`}
//               value={option.id}
//               checked={selectedOption === option.id}
//               onChange={() => onSelect(question.id, option.id)}
//               className="mt-1"
//             />
//             <MathJax dynamic>
//               <span dangerouslySetInnerHTML={{ __html: option.text }} />
//             </MathJax>
//           </label>
//         ))}
//       </div>

//       <div className="text-sm text-gray-500 mt-2">Marks: {question.marks}</div>
//     </div>
//   )
// }
import { useState } from 'react'
import { Route } from './route'
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked'

export default function AttemptPage() {
  const { attemptId } = Route.useParams()
  const test = Route.useLoaderData()

  // Question state tracking
  const totalQuestions = test.questions.length
  const [current, setCurrent] = useState(0)
  // { [questionId]: optionId }
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({})
  // { [questionId]: 'not_visited' | 'not_answered' | 'answered' | 'marked' }
  const [status, setStatus] = useState<{ [questionId: number]: QuestionStatus }>(() => {
    const map: { [questionId: number]: QuestionStatus } = {}
    test.questions.forEach((q: any) => (map[q.id] = 'not_visited'))
    return map
  })

  // Navigates to a question and sets status if needed
  const goToQuestion = (idx: number) => {
    const qId = test.questions[idx].id
    setCurrent(idx)
    setStatus((prev) => ({
      ...prev,
      [qId]: prev[qId] === 'not_visited' ? 'not_answered' : prev[qId],
    }))
  }

  // Option select logic
  const handleOptionSelect = (questionId: number, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    setStatus((prev) => ({
      ...prev,
      [questionId]: 'answered',
    }))
  }

  //go to nextt
  const goToNext = () => {
  if (current < totalQuestions - 1) {
    goToQuestion(current + 1)
  }
}

  // Mark for review logic
  const markForReview = () => {
    const qId = test.questions[current].id
    setStatus((prev) => ({
      ...prev,
      [qId]: 'marked',
    }))
    // Move to next question if possible
    if (current < totalQuestions - 1) {
      goToQuestion(current + 1)
    }
  }

  // Clear response logic
  const clearResponse = () => {
    const qId = test.questions[current].id
    setAnswers((prev) => {
      const { [qId]: _, ...rest } = prev
      return rest
    })
    setStatus((prev) => ({
      ...prev,
      [qId]: 'not_answered',
    }))
  }

  // Submission logic
  const submitTest = async () => {
    const payload = {
      answers: Object.entries(answers).map(([qid, oid]) => ({
        objectiveQuestionId: Number(qid),
        selectedOptionOriginalId: oid,
      })),
    }
    try {
      await fetch(`/tests/attempts/${attemptId}/objective-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      toast.success('Test Submitted Successfully')
      // Optionally: Route.navigate('/dashboard/tests')
    } catch {
      toast.error('Failed to submit test')
    }
  }

  // Button background and text based on status (🟩🟥🟨⚪)
  function getButtonStyle(idx: number) {
    const qId = test.questions[idx].id
    switch (status[qId]) {
      case 'answered':
        return 'bg-green-500 text-white border-green-600'
      case 'not_answered':
        return 'bg-red-500 text-white border-red-600' // 🟥
      case 'marked':
        return 'bg-yellow-400 text-black border-yellow-600' // 🟨
      case 'not_visited':
      default:
        return 'bg-gray-200 text-gray-800 border-gray-300' // ⚪
    }
  }



  // MathJax config
  const mathJaxConfig = {
    loader: { load: ['[tex]/ams'] },
    tex: {
      packages: { '[+]': ['ams'] },
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
    },
  }

  // Current question
  const question = test.questions[current]

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="p-6">
        <h1 className="text-3xl font-bold">{test.title}</h1>
        <p className="text-gray-600">{test.description}</p>
        <div className="mt-2 space-x-4 text-sm text-gray-700">
          <span>⏱️ Time Limit: {test.timeLimit} mins</span>
          <span>🎯 Total Marks: {test.totalMarks}</span>
        </div>

        {/* Question Navigation Grid */}
        <div className="my-6">
          <div className="grid grid-cols-5 gap-2">
            {[...Array(totalQuestions)].map((_, idx) => (
              <Button
                key={idx}
                variant="outline"
                onClick={() => goToQuestion(idx)}
                className={`h-10 w-10 rounded-full text-sm flex items-center justify-center border-2 font-bold transition
                  ${getButtonStyle(idx)}
                  ${current === idx ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
                aria-label={`Question ${idx + 1} (${status[test.questions[idx].id]})`}
              >
                <span className="sr-only">{status[test.questions[idx].id]}</span>
                <span className="ml-0.5">{idx + 1}</span>
              </Button>
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-xs items-center">
            <span className="flex items-center gap-1"><span className="text-lg">🟩</span>Answered</span>
            <span className="flex items-center gap-1"><span className="text-lg">🟥</span>Not Answered</span>
            <span className="flex items-center gap-1"><span className="text-lg">🟨</span>Marked for Review</span>
            <span className="flex items-center gap-1"><span className="text-lg">⚪</span>Not Visited</span>
          </div>
        </div>

        {/* Only show one question at a time */}
        <div className="mt-8">
          <QuestionCard
            question={question}
            index={current}
            selectedOption={answers[question.id]}
            onSelect={handleOptionSelect}
          />

          {/* Mark/Clear/Submit controls */}
          <div className="mt-4 flex gap-4">
            <Button
  onClick={goToNext}
  disabled={current === totalQuestions - 1}
>
  Next
</Button>
            <Button onClick={markForReview}>Mark for Review & Next</Button>
            <Button onClick={clearResponse}>Clear Response</Button>
            <Button onClick={submitTest} variant="outline">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </MathJaxContext>
  )
}

function QuestionCard({
  question,
  index,
  selectedOption,
  onSelect,
}: {
  question: any
  index: number
  selectedOption?: string
  onSelect: (questionId: number, optionId: string) => void
}) {
  return (
    <div className="p-4 border rounded-md shadow-sm bg-white">
      <div className="mb-2 font-semibold">
        Q{index + 1}.{' '}
        <MathJax dynamic>
          <span dangerouslySetInnerHTML={{ __html: question.questionText }} />
        </MathJax>
      </div>

      <div className="pl-4 space-y-2">
        {question.options.map((option: any) => (
          <label
            key={option.id}
            className={`flex items-start gap-2 p-2 border rounded cursor-pointer ${
              selectedOption === option.id ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => onSelect(question.id, option.id)}
              className="mt-1"
            />
            <MathJax dynamic>
              <span dangerouslySetInnerHTML={{ __html: option.text }} />
            </MathJax>
          </label>
        ))}
      </div>

      <div className="text-sm text-gray-500 mt-2">Marks: {question.marks}</div>
    </div>
  )
}