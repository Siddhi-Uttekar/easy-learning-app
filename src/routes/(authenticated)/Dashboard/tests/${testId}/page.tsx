import { Route } from './route'
import { MathJaxContext, MathJax } from 'better-react-mathjax'

export default function Page() {
  const test = Route.useLoaderData()
  const { testId } = Route.useParams()

  const mathJaxConfig = {
    loader: { load: ['[tex]/ams'] },
    tex: {
      packages: { '[+]': ['ams'] },
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
    },
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="p-6">
        <h1 className="text-3xl font-bold">{test.title}</h1>
        <p className="text-gray-600">{test.description}</p>
        <div className="mt-2 space-x-4 text-sm text-gray-700">
          <span>⏱️ Time Limit: {test.timeLimit} mins</span>
          <span>🎯 Total Marks: {test.totalMarks}</span>
        </div>

        <div className="mt-8 space-y-6">
          {(test.questions as any[])
            .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
            .map((question: any, index: number) => (
              <QuestionCard key={question.id} question={question} index={index} />
            ))}
        </div>
      </div>
    </MathJaxContext>
  )
}

function QuestionCard({ question, index }: { question: any, index: number }) {
  return (
    <div className="p-4 border rounded-md shadow-sm bg-white">
      {/* Question Text */}
      <div className="mb-2 font-semibold">
        Q{index + 1}.{' '}
        <MathJax dynamic>
          <span dangerouslySetInnerHTML={{ __html: question.questionText }} />
        </MathJax>
      </div>

      {/* Options */}
      <div className="pl-4 space-y-2">
        {question.options.map((option: any) => (
          <div
            key={option.id}
            className={`p-2 border rounded transition-all ${
              option.isCorrect
                ? 'border-green-500 bg-green-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <MathJax dynamic>
              <span dangerouslySetInnerHTML={{ __html: option.text }} />
            </MathJax>
          </div>
        ))}
      </div>

      {/* Marks */}
      <div className="text-sm text-gray-500 mt-2">
        Marks: {question.marks}
      </div>

      {/* Solution */}
      {question.solution && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm">
          <strong className="text-blue-800">Solution:</strong>
          <MathJax dynamic>
            <div dangerouslySetInnerHTML={{ __html: question.solution }} />
          </MathJax>
        </div>
      )}
    </div>
  )
}

