import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bento-card-glass p-8 text-center">
        <Skeleton className="h-9 w-20 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-24 mx-auto mt-3 rounded" />
      </div>
    ))}
  </div>
);

export const JobCardSkeleton = () => (
  <div className="bento-card-glass p-6" aria-hidden="true">
    <div className="flex items-start justify-between mb-5">
      <Skeleton className="w-14 h-14 rounded-xl" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-5 w-3/4 rounded" />
    <Skeleton className="h-4 w-1/2 rounded mt-3" />
    <div className="space-y-2 mt-5">
      <Skeleton className="h-4 w-2/5 rounded" />
      <Skeleton className="h-4 w-1/3 rounded" />
    </div>
    <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/20">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-4 w-16 rounded" />
    </div>
  </div>
);

export const JobGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <JobCardSkeleton key={index} />
    ))}
  </div>
);

export const BlogCardSkeleton = () => (
  <div className="liquid-glass rounded-2xl overflow-hidden" aria-hidden="true">
    <Skeleton className="w-full aspect-[16/10] rounded-none" />
    <div className="p-5 sm:p-6">
      <Skeleton className="h-4 w-32 rounded mb-4" />
      <Skeleton className="h-5 w-full rounded mb-2" />
      <Skeleton className="h-5 w-2/3 rounded mb-4" />
      <Skeleton className="h-4 w-full rounded mb-2" />
      <Skeleton className="h-4 w-4/5 rounded" />
      <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-100">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  </div>
);

export const BlogGridSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <BlogCardSkeleton key={index} />
    ))}
  </div>
);

export const JobDetailsSkeleton = () => (
  <div className="min-h-screen bg-white/15 border border-white/40 py-8 rounded-[2rem] mx-2 sm:mx-4" aria-hidden="true">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-28 rounded mb-6" />
      <div className="bento-card-glass overflow-hidden p-8">
        <div className="flex items-start gap-4 mb-8">
          <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-7 w-3/4 rounded" />
            <Skeleton className="h-5 w-1/3 rounded mt-3" />
            <Skeleton className="h-4 w-1/2 rounded mt-3" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-6 w-40 rounded mb-4" />
        <Skeleton className="h-4 w-full rounded mb-2" />
        <Skeleton className="h-4 w-full rounded mb-2" />
        <Skeleton className="h-4 w-5/6 rounded mb-8" />
        <Skeleton className="h-6 w-40 rounded mb-4" />
        <Skeleton className="h-4 w-full rounded mb-2" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>
    </div>
  </div>
);

export const BlogArticleSkeleton = () => (
  <div className="min-h-screen bg-transparent py-8 sm:py-12" aria-hidden="true">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-5 w-36 rounded mb-8" />
      <div className="liquid-glass rounded-3xl overflow-hidden">
        <Skeleton className="w-full aspect-[16/9] rounded-none" />
        <div className="p-6 sm:p-10">
          <Skeleton className="h-4 w-48 rounded mb-4" />
          <Skeleton className="h-9 w-full rounded mb-3" />
          <Skeleton className="h-9 w-2/3 rounded mb-8" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="min-h-screen py-8 px-4" aria-hidden="true">
    <div className="max-w-7xl mx-auto">
      <Skeleton className="h-8 w-64 rounded mb-4" />
      <Skeleton className="h-4 w-96 max-w-full rounded mb-8" />
      <JobGridSkeleton count={6} />
    </div>
  </div>
);
