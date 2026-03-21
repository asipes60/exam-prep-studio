-- ============================================================================
-- Plan Progress Migration
-- Created: 2026-03-21
-- Adds: completed_weeks column to exam_prep_assessments
-- ============================================================================

alter table public.exam_prep_assessments
  add column if not exists completed_weeks integer[] not null default '{}';
