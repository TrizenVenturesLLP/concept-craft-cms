import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Save, Eye, EyeOff } from 'lucide-react';
import {
  DOMAINS,
  CATEGORIES,
  DIFFICULTIES,
  COMMON_TECHNOLOGIES,
  COMMON_DELIVERABLES,
  COMMON_PREREQUISITES,
  COMMON_LEARNING_OUTCOMES,
  CreateProblemData,
  ProblemStatement
} from '@/services/problemService';

// Validation schema
const problemSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  abstract: z.string().min(50, 'Abstract must be at least 50 characters').max(5000, 'Abstract must be less than 5000 characters'),
  domain: z.enum(DOMAINS as [string, ...string[]], { required_error: 'Please select a domain' }),
  category: z.enum(CATEGORIES, { required_error: 'Please select a category' }),
  difficulty: z.enum(DIFFICULTIES, { required_error: 'Please select a difficulty level' }),
  duration: z.string().min(1, 'Duration is required').max(50, 'Duration must be less than 50 characters'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
  prerequisites: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type ProblemFormData = z.infer<typeof problemSchema>;

interface ProblemFormProps {
  problem?: ProblemStatement;
  onSubmit: (data: CreateProblemData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function ProblemForm({ problem, onSubmit, onCancel, isLoading = false, mode }: ProblemFormProps) {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [customTech, setCustomTech] = useState('');
  const [customDeliverable, setCustomDeliverable] = useState('');
  const [customPrerequisite, setCustomPrerequisite] = useState('');
  const [customOutcome, setCustomOutcome] = useState('');
  const [customTag, setCustomTag] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: problem?.title || '',
      abstract: problem?.abstract || '',
      domain: problem?.domain || '',
      category: problem?.category || 'Major',
      difficulty: problem?.difficulty || 'Intermediate',
      duration: problem?.duration || '',
      technologies: problem?.technologies || [],
      deliverables: problem?.deliverables || [],
      prerequisites: problem?.prerequisites || [],
      learningOutcomes: problem?.learningOutcomes || [],
      tags: problem?.tags || [],
    }
  });

  const { fields: techFields, append: appendTech, remove: removeTech } = useFieldArray({
    control,
    name: 'technologies'
  });

  const { fields: deliverableFields, append: appendDeliverable, remove: removeDeliverable } = useFieldArray({
    control,
    name: 'deliverables'
  });

  const { fields: prerequisiteFields, append: appendPrerequisite, remove: removePrerequisite } = useFieldArray({
    control,
    name: 'prerequisites'
  });

  const { fields: outcomeFields, append: appendOutcome, remove: removeOutcome } = useFieldArray({
    control,
    name: 'learningOutcomes'
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
  });

  const watchedValues = watch();

  const addCustomItem = (type: 'tech' | 'deliverable' | 'prerequisite' | 'outcome' | 'tag') => {
    const value = (() => {
      switch (type) {
        case 'tech': return customTech;
        case 'deliverable': return customDeliverable;
        case 'prerequisite': return customPrerequisite;
        case 'outcome': return customOutcome;
        case 'tag': return customTag;
        default: return '';
      }
    })();

    if (value.trim()) {
      switch (type) {
        case 'tech':
          appendTech(value.trim());
          setCustomTech('');
          break;
        case 'deliverable':
          appendDeliverable(value.trim());
          setCustomDeliverable('');
          break;
        case 'prerequisite':
          appendPrerequisite(value.trim());
          setCustomPrerequisite('');
          break;
        case 'outcome':
          appendOutcome(value.trim());
          setCustomOutcome('');
          break;
        case 'tag':
          appendTag(value.trim());
          setCustomTag('');
          break;
      }
    }
  };

  const addFromCommon = (item: string, type: 'tech' | 'deliverable' | 'prerequisite' | 'outcome') => {
    switch (type) {
      case 'tech':
        if (!watchedValues.technologies?.includes(item)) {
          appendTech(item);
        }
        break;
      case 'deliverable':
        if (!watchedValues.deliverables?.includes(item)) {
          appendDeliverable(item);
        }
        break;
      case 'prerequisite':
        if (!watchedValues.prerequisites?.includes(item)) {
          appendPrerequisite(item);
        }
        break;
      case 'outcome':
        if (!watchedValues.learningOutcomes?.includes(item)) {
          appendOutcome(item);
        }
        break;
    }
  };

  const onSubmitForm = async (data: ProblemFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: `Problem statement ${mode === 'create' ? 'created' : 'updated'} successfully!`,
      });
    } catch (error: any) {
      console.error('Problem form error:', error);
      
      // Extract specific error message
      let errorMessage = `Failed to ${mode === 'create' ? 'create' : 'update'} problem statement.`;
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.map((err: any) => err.msg || err.message).join(', ');
        } else {
          errorMessage = Object.values(validationErrors).join(', ');
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (previewMode) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preview: {watchedValues.title || 'Untitled Problem'}</CardTitle>
              <CardDescription>This is how your problem statement will appear</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(false)}
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Edit Mode
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Domain</Label>
              <p className="text-sm">{watchedValues.domain}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Category</Label>
              <p className="text-sm">{watchedValues.category}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Difficulty</Label>
              <p className="text-sm">{watchedValues.difficulty}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-500">Duration</Label>
            <p className="text-sm">{watchedValues.duration}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Abstract</Label>
            <p className="text-sm whitespace-pre-wrap">{watchedValues.abstract}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Technologies</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {watchedValues.technologies?.map((tech, index) => (
                <Badge key={index} variant="secondary">{tech}</Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Deliverables</Label>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              {watchedValues.deliverables?.map((deliverable, index) => (
                <li key={index}>{deliverable}</li>
              ))}
            </ul>
          </div>

          {watchedValues.prerequisites && watchedValues.prerequisites.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Prerequisites</Label>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                {watchedValues.prerequisites.map((prerequisite, index) => (
                  <li key={index}>{prerequisite}</li>
                ))}
              </ul>
            </div>
          )}

          {watchedValues.learningOutcomes && watchedValues.learningOutcomes.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Learning Outcomes</Label>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                {watchedValues.learningOutcomes.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}

          {watchedValues.tags && watchedValues.tags.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Tags</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {watchedValues.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {mode === 'create' ? 'Create New Problem Statement' : 'Edit Problem Statement'}
              </CardTitle>
              <CardDescription>
                {mode === 'create' 
                  ? 'Fill in the details to create a new problem statement'
                  : 'Update the problem statement details'
                }
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(true)}
              disabled={!watchedValues.title || !watchedValues.abstract}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., AI-Powered Personal Finance Manager"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  {...register('duration')}
                  placeholder="e.g., 12-16 weeks"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Select onValueChange={(value) => setValue('domain', value)} defaultValue={watchedValues.domain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.domain && (
                  <p className="text-sm text-red-500">{errors.domain.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => setValue('category', value as any)} defaultValue={watchedValues.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select onValueChange={(value) => setValue('difficulty', value as any)} defaultValue={watchedValues.difficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficulty && (
                  <p className="text-sm text-red-500">{errors.difficulty.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract *</Label>
              <Textarea
                id="abstract"
                {...register('abstract')}
                placeholder="Provide a detailed description of the problem statement, including objectives, scope, and expected outcomes..."
                rows={6}
              />
              {errors.abstract && (
                <p className="text-sm text-red-500">{errors.abstract.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Technologies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technologies *</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  placeholder="Add custom technology"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('tech'))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomItem('tech')}
                  disabled={!customTech.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {COMMON_TECHNOLOGIES.map((tech) => (
                  <Button
                    key={tech}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFromCommon(tech, 'tech')}
                    disabled={watchedValues.technologies?.includes(tech)}
                  >
                    {tech}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {techFields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
                    {watchedValues.technologies?.[index]}
                    <button
                      type="button"
                      onClick={() => removeTech(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            {errors.technologies && (
              <p className="text-sm text-red-500">{errors.technologies.message}</p>
            )}
          </div>

          <Separator />

          {/* Deliverables */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Deliverables *</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={customDeliverable}
                  onChange={(e) => setCustomDeliverable(e.target.value)}
                  placeholder="Add custom deliverable"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('deliverable'))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomItem('deliverable')}
                  disabled={!customDeliverable.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {COMMON_DELIVERABLES.map((deliverable) => (
                  <Button
                    key={deliverable}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFromCommon(deliverable, 'deliverable')}
                    disabled={watchedValues.deliverables?.includes(deliverable)}
                    className="justify-start text-left h-auto p-2"
                  >
                    {deliverable}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {deliverableFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1">{watchedValues.deliverables?.[index]}</span>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {errors.deliverables && (
              <p className="text-sm text-red-500">{errors.deliverables.message}</p>
            )}
          </div>

          <Separator />

          {/* Prerequisites */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Prerequisites</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={customPrerequisite}
                  onChange={(e) => setCustomPrerequisite(e.target.value)}
                  placeholder="Add custom prerequisite"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('prerequisite'))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomItem('prerequisite')}
                  disabled={!customPrerequisite.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {COMMON_PREREQUISITES.map((prerequisite) => (
                  <Button
                    key={prerequisite}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFromCommon(prerequisite, 'prerequisite')}
                    disabled={watchedValues.prerequisites?.includes(prerequisite)}
                    className="justify-start text-left h-auto p-2"
                  >
                    {prerequisite}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {prerequisiteFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1">{watchedValues.prerequisites?.[index]}</span>
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Learning Outcomes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Learning Outcomes</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={customOutcome}
                  onChange={(e) => setCustomOutcome(e.target.value)}
                  placeholder="Add custom learning outcome"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('outcome'))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomItem('outcome')}
                  disabled={!customOutcome.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {COMMON_LEARNING_OUTCOMES.map((outcome) => (
                  <Button
                    key={outcome}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFromCommon(outcome, 'outcome')}
                    disabled={watchedValues.learningOutcomes?.includes(outcome)}
                    className="justify-start text-left h-auto p-2"
                  >
                    {outcome}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {outcomeFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1">{watchedValues.learningOutcomes?.[index]}</span>
                    <button
                      type="button"
                      onClick={() => removeOutcome(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('tag'))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomItem('tag')}
                  disabled={!customTag.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tagFields.map((field, index) => (
                  <Badge key={field.id} variant="outline" className="flex items-center gap-1">
                    {watchedValues.tags?.[index]}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          {mode === 'create' ? 'Create Problem' : 'Update Problem'}
        </Button>
      </div>
    </form>
  );
}
