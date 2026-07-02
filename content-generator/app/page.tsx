'use client';

import { useState } from 'react';

type ContentType = 'blog-outline' | 'social-caption' | 'product-description';

interface ContentOption {
  id: ContentType;
  gateId: string;
  title: string;
  description: string;
  placeholder: string;
}

const contentOptions: ContentOption[] = [
  {
    id: 'blog-outline',
    gateId: process.env.NEXT_PUBLIC_VERLON_GATE_ID_BLOG ?? '',
    title: 'Blog Outline',
    description: 'Generate structured outlines for blog posts',
    placeholder: 'Enter your blog topic (e.g., "The future of AI in healthcare")',
  },
  {
    id: 'social-caption',
    gateId: process.env.NEXT_PUBLIC_VERLON_GATE_ID_SOCIAL ?? '',
    title: 'Social Media Caption',
    description: 'Create engaging social media captions',
    placeholder: 'Describe the post content (e.g., "New product launch announcement")',
  },
  {
    id: 'product-description',
    gateId: process.env.NEXT_PUBLIC_VERLON_GATE_ID_PRODUCT ?? '',
    title: 'Product Description',
    description: 'Write compelling product descriptions',
    placeholder: 'Describe your product (e.g., "Wireless noise-cancelling headphones")',
  },
];

export default function Home() {
  const [selectedType, setSelectedType] = useState<ContentType>('blog-outline');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedOption = contentOptions.find((opt) => opt.id === selectedType)!;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gateId: selectedOption.gateId,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setResult(data.content);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Content Generator
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Powered by{' '}
            <a
              href="https://verlon.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
            >
              Verlon AI
            </a>
            's smart routing
          </p>
        </div>

        {/* Content Type Selection */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Select Content Type
          </label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {contentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedType(option.id);
                  setPrompt('');
                  setResult('');
                  setError('');
                }}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedType === option.id
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <h3 className="mb-1 font-semibold">{option.title}</h3>
                <p
                  className={`text-sm ${
                    selectedType === option.id
                      ? 'text-zinc-100 dark:text-zinc-800'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Enter Your Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={selectedOption.placeholder}
            rows={4}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="mb-8 w-full rounded-lg bg-zinc-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? 'Generating...' : 'Generate Content'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Generated Content
            </h2>
            <div className="prose prose-zinc max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {result}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>
            This demo showcases Verlon AI's ability to intelligently route requests to the
            best AI model based on your task requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
