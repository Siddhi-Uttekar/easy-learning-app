/* src/pages/tests/$testId/submit-objective/index.tsx */
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, CheckCircle } from 'lucide-react';

type SubmissionStatus = 'Not Submitted' | 'Submitted';

const demoTest = {
  name: 'Subjective Test – Demo 01',
  subject: 'Mathematics',
  duration: '60 mins',
  marks: 50,
  status: 'Not Submitted' as SubmissionStatus,
  questionPaperUrl: '/Demo_Questions.pdf',
};

export const Route = createFileRoute('/(authenticated)/Dashboard/tests/$testId/submit-subjective/page')({
  component: SubmitObjectivePage,
});

export default function SubmitObjectivePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* 1️⃣ Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{demoTest.name}</CardTitle>
          <CardDescription>
            <span className="block">
              Subject: <strong>{demoTest.subject}</strong>
            </span>
            <span className="block">
              Duration: {demoTest.duration} &bull; Marks: {demoTest.marks}
            </span>
          </CardDescription>
          <Badge
            variant={demoTest.status === 'Submitted' ? 'default' : 'secondary'}
            className="w-fit"
          >
            {demoTest.status}
          </Badge>
        </CardHeader>
      </Card>

      {/* 2️⃣ Question Paper Section */}

<Card>
  <CardHeader>
    <CardTitle className="text-lg">Question Paper</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Download */}
    <Button variant="outline" asChild>
      <a href={demoTest.questionPaperUrl} download>
        <FileText className="mr-2 h-4 w-4" />
        Download PDF
      </a>
    </Button>

    {/* Tiny inline preview instead of Accordion */}
    <details className="text-sm">
      <summary className="cursor-pointer text-muted-foreground hover:underline">
        Preview questions
      </summary>
      <ul className="mt-2 list-disc list-inside text-muted-foreground">
        <li>Solve x² - 5x + 6 = 0.</li>
        <li>Find the derivative of sin(x).</li>
        <li>Evaluate ∫ x dx.</li>
      </ul>
    </details>
  </CardContent>
</Card>

      {/* 3️⃣ Answer Submission Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Answers</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* Option A – PDF */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Option A: Upload PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Upload your completed answer sheet in PDF format.
              </p>
              {pdfFile && (
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPdfFile(null)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Option B – Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Option B: Upload Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setImages(Array.from(e.target.files || []))
                }
              />
              <p className="text-sm text-muted-foreground">
                JPG / PNG images of each page.
              </p>

              {images.length > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(img)}
                        alt={`page-${idx}`}
                        className="rounded border"
                      />
                    ))}
                  </div>
                  <Button variant="secondary" disabled>
                    Compile to PDF (Coming Soon)
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* 4️⃣ Preview & Edit Submission */}
      {(pdfFile || images.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pdfFile && (
              <p className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {pdfFile.name}
              </p>
            )}
            {images.length > 0 && (
              <p className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {images.length} image(s) uploaded
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPdfFile(null);
                  setImages([]);
                }}
              >
                Replace Submission
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setPdfFile(null);
                  setImages([]);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5️⃣ Final Submission */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur py-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full md:w-auto"
              disabled={!pdfFile && images.length === 0}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Final Submit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
              <AlertDialogDescription>
                Once submitted, you will not be able to change your answers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  /* TODO: POST to backend */
                  console.log('Submitted!');
                }}
              >
                Yes, Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}