import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const CVUpload = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      if (uploadedFile.type === 'application/pdf') {
        setFile(uploadedFile);
        setAnalysis(null);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);
    if (user?.id) {
      formData.append('user_id', user.id);
    }

    try {
      const response = await aiAPI.analyzeCV(formData);
      
      if (response.data?.analysis) {
        toast.success('Resume analyzed successfully!');
        
        const analysisId = response.data.analysis.id;
        console.log('Analysis ID:', analysisId);
        if (analysisId) {
          navigate(`/cv-analysis?id=${analysisId}`);
        } else {
          console.error('No analysis ID in response');
        }
        
        if (response.data.analysis.skills) {
          await refreshUser();
        }
      } else {
        console.error('No analysis in response:', response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Resume Analyzer</h1>
          <p className="text-gray-600 mt-1">Upload your resume and get AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h2>
            
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-12 text-center cursor-pointer transition-colors ${
                   dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your resume here
                </h3>
                <p className="text-gray-500 mb-4">or click to browse</p>
                <p className="text-sm text-gray-400">PDF format only, max 10MB</p>
              </div>
            ) : (
              <div className="border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Analyze with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What We Analyze</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Skills Extraction</h3>
                  <p className="text-sm text-gray-600">Identify technical and soft skills from your resume</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Experience Analysis</h3>
                  <p className="text-sm text-gray-600">Extract and summarize your work experience</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Education Recognition</h3>
                  <p className="text-sm text-gray-600">Identify degrees, certifications, and training</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">ATS Score</h3>
                  <p className="text-sm text-gray-600">See how well your resume performs with ATS systems</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
                <h3 className="text-sm opacity-80 mb-2">Word Count</h3>
                <p className="text-3xl font-bold">{analysis.word_count}</p>
              </div>
              <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl p-6 text-white">
                <h3 className="text-sm opacity-80 mb-2">Skills Found</h3>
                <p className="text-3xl font-bold">{analysis.skills?.length || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <h3 className="text-sm opacity-80 mb-2">Summary</h3>
                <p className="text-sm">{analysis.summary}</p>
              </div>
            </div>

            {analysis.skills && analysis.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill, i) => (
                    <span key={i} className="badge bg-primary-100 text-primary-700 px-3 py-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.experience && analysis.experience.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Experience Sections</h3>
                <div className="space-y-4">
                  {analysis.experience.slice(0, 3).map((exp, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {exp.substring(0, 300)}
                        {exp.length > 300 && '...'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.education && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Education</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {analysis.education.degrees?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Degrees Found:</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.education.degrees.map((deg, i) => (
                          <span key={i} className="badge bg-secondary-100 text-secondary-700">
                            {deg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {analysis.contact && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysis.contact.emails?.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{analysis.contact.emails[0]}</p>
                    </div>
                  )}
                  {analysis.contact.phones?.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{analysis.contact.phones[0]}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={handleReset} className="btn-outline">
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVUpload;
