"use client";

import { useState, useEffect } from "react";
import { Route } from "./route";
import { MathJaxContext, MathJax } from "better-react-mathjax";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, User, FileText, Eye } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

type QuestionStatus = "not_visited" | "not_answered" | "answered" | "marked";

export default function AttemptPage() {
  const { attemptId } = Route.useParams();
  const test = Route.useLoaderData();
  const { setOpen } = useSidebar();

  // Question state tracking
  const totalQuestions = test.questions.length;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [status, setStatus] = useState<{
    [questionId: number]: QuestionStatus;
  }>(() => {
    const map: { [questionId: number]: QuestionStatus } = {};
    test.questions.forEach((q: any) => (map[q.id] = "not_visited"));
    return map;
  });

  // Timer state (mock timer)
  const [timeLeft, setTimeLeft] = useState("30:00"); // 30 minutes

  // Navigates to a question and sets status if needed
  const goToQuestion = (idx: number) => {
    const qId = test.questions[idx].id;
    setCurrent(idx);
    setStatus((prev) => ({
      ...prev,
      [qId]: prev[qId] === "not_visited" ? "not_answered" : prev[qId],
    }));
  };

  // Option select logic
  const handleOptionSelect = (questionId: number, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setStatus((prev) => ({
      ...prev,
      [questionId]: "answered",
    }));
  };

  // Go to next
  const goToNext = () => {
    if (current < totalQuestions - 1) {
      goToQuestion(current + 1);
    }
  };

  // Mark for review logic
  const markForReview = () => {
    const qId = test.questions[current].id;
    setStatus((prev) => ({
      ...prev,
      [qId]: "marked",
    }));
    if (current < totalQuestions - 1) {
      goToQuestion(current + 1);
    }
  };

  // Clear response logic
  const clearResponse = () => {
    const qId = test.questions[current].id;
    setAnswers((prev) => {
      const { [qId]: _, ...rest } = prev;
      return rest;
    });
    setStatus((prev) => ({
      ...prev,
      [qId]: "not_answered",
    }));
  };

  useEffect(() => {
    setOpen(false); // Collapse the sidebar on mount
  }, []);

  // Submission logic
  const submitTest = async () => {
    const payload = {
      answers: Object.entries(answers).map(([qid, oid]) => ({
        objectiveQuestionId: Number(qid),
        selectedOptionOriginalId: oid,
      })),
    };

    try {
      await fetch(`/tests/attempts/${attemptId}/objective-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Test Submitted Successfully");
    } catch {
      toast.error("Failed to submit test");
    }
  };

  // Button style based on status
  function getButtonStyle(idx: number) {
    const qId = test.questions[idx].id;
    const isCurrentQuestion = current === idx;

    let baseStyle =
      "h-10 w-10 text-sm font-semibold border transition-all duration-200 ";

    switch (status[qId]) {
      case "answered":
        baseStyle +=
          "bg-green-500 text-white border-green-600 hover:bg-green-600";
        break;
      case "not_answered":
        baseStyle += "bg-red-500 text-white border-red-600 hover:bg-red-600";
        break;
      case "marked":
        baseStyle +=
          "bg-purple-500 text-white border-purple-600 hover:bg-purple-600";
        break;
      case "not_visited":
      default:
        baseStyle +=
          "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300";
        break;
    }

    if (isCurrentQuestion) {
      baseStyle += " ring-2 ring-blue-500 ring-offset-1 scale-110";
    }

    return baseStyle;
  }

  // Get answer statistics
  const getAnswerStats = () => {
    const answered = Object.values(status).filter(
      (s) => s === "answered"
    ).length;
    const notAnswered = Object.values(status).filter(
      (s) => s === "not_answered"
    ).length;
    const marked = Object.values(status).filter((s) => s === "marked").length;
    const notVisited = Object.values(status).filter(
      (s) => s === "not_visited"
    ).length;

    return { answered, notAnswered, marked, notVisited };
  };

  const stats = getAnswerStats();

  // MathJax config
  const mathJaxConfig = {
    loader: { load: ["[tex]/ams"] },
    tex: {
      packages: { "[+]": ["ams"] },
      inlineMath: [
        ["$", "$"],
        ["$$", "$$"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
    },
  };

  const question = test.questions[current];

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        {/* <header className="bg-teal-700 text-white px-6 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">PCM Mock Test</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              className="bg-teal-600 hover:bg-teal-500 text-white border-0"
            >
              <FileText className="w-4 h-4 mr-2" />
              Question Paper
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white border-0"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Instruction
            </Button>
          </div>
        </header> */}

        {/* Subject Tabs */}
        <div className="bg-white border-b">
          <div className="px-6 py-2 flex gap-2">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg text-sm font-medium">
              Physics
            </div>
            {/* <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-t-lg text-sm font-medium cursor-pointer hover:bg-gray-300">
              Mathematics
            </div> */}
          </div>
        </div>

        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-64 bg-white border-r min-h-screen">
            <div className="p-4">
              <div className="text-sm font-medium text-gray-600 mb-3">
                Section
              </div>

              {/* Subject Sections */}
              <div className="space-y-2 mb-6">
                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm font-medium">
                  Physics
                </div>
                {/* <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm font-medium cursor-pointer hover:bg-gray-200">
                  Chemistry
                </div> */}
              </div>

              {/* Question Navigation */}
              <div className="text-sm font-medium text-gray-600 mb-3">
                Choose a Question
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(Math.min(totalQuestions, 16))].map((_, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    onClick={() => goToQuestion(idx)}
                    className={getButtonStyle(idx)}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Question Header */}
              <div className="border-b p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-red-500 text-sm">
                      Question Type: Multiple Choice Question
                    </span>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Marks for correct answer: {question.marks}</span>
                      <span>Negative Marks: 0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Question No. {current + 1}
                  </h2>
                  <div className="text-gray-800 leading-relaxed">
                    <MathJax dynamic>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: question.questionText,
                        }}
                      />
                    </MathJax>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option: any, idx: number) => (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        answers[question.id] === option.id
                          ? "bg-blue-50 border-blue-300"
                          : "hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() =>
                          handleOptionSelect(question.id, option.id)
                        }
                        className="mt-1 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <MathJax dynamic>
                          <div
                            dangerouslySetInnerHTML={{ __html: option.text }}
                          />
                        </MathJax>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="border-t p-4 flex justify-between">
                <div className="flex gap-3">
                  <Button
                    onClick={markForReview}
                    variant="outline"
                    className="bg-gray-100 hover:bg-gray-200"
                  >
                    Mark for Review & Next
                  </Button>
                  <Button
                    onClick={clearResponse}
                    variant="outline"
                    className="bg-gray-100 hover:bg-gray-200"
                  >
                    Clear Response
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={goToNext}
                    disabled={current === totalQuestions - 1}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save & Next
                  </Button>
                  <Button
                    onClick={submitTest}
                    className="bg-blue-400 hover:bg-blue-500"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-64 bg-white border-l min-h-screen">
            <div className="p-4">
              {/* Timer */}
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-1">Time Left :</div>
                <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  {timeLeft}
                </div>
              </div>

              {/* User Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-600" />
                </div>
              </div>

              {/* Answer Statistics */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      {stats.answered}
                    </div>
                    <span className="text-sm">Answered</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      {stats.notAnswered}
                    </div>
                    <span className="text-sm">Not Answered</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded text-white text-xs flex items-center justify-center font-bold">
                      {stats.notVisited}
                    </div>
                    <span className="text-sm">Not Visited</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      {stats.marked}
                    </div>
                    <span className="text-sm">Marked for Review</span>
                  </div>
                </div>
              </div>

              {/* Subject Section */}
              <div className="bg-blue-100 p-3 rounded">
                <div className="text-blue-800 font-medium text-sm mb-2">
                  Physics
                </div>
                <div className="text-sm text-blue-700">Choose a Question</div>
                <div className="grid grid-cols-4 gap-1 mt-3">
                  {[...Array(Math.min(totalQuestions, 20))].map((_, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => goToQuestion(idx)}
                      className={`h-8 w-8 text-xs ${getButtonStyle(idx)}`}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
}
