/**
 * Validation schemas for all API endpoints
 */

export const validationSchemas = {
  // User validation schemas
  user: {
    create: {
      email: { 
        type: 'email', 
        required: true,
        transform: (v: string) => v.toLowerCase().trim()
      },
      name: { 
        type: 'string', 
        required: true, 
        min: 2, 
        max: 100,
        transform: (v: string) => v.trim()
      },
      age: { 
        type: 'number', 
        required: true, 
        min: 10, 
        max: 25 
      },
      role: { 
        type: 'enum', 
        values: ['PLAYER', 'COACH', 'ADMIN'], 
        required: true 
      },
      position: {
        type: 'enum',
        values: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'],
        required: false
      },
      parentEmail: {
        type: 'email',
        required: false,
        custom: (value: any, data: any) => {
          // Require parent email for players under 16
          if (data.age < 16 && data.role === 'PLAYER' && !value) {
            return 'Parent email is required for players under 16';
          }
          return true;
        }
      },
      teamId: {
        type: 'string',
        required: false,
        pattern: /^[a-f0-9-]{36}$/
      }
    },
    update: {
      email: { type: 'email' },
      name: { type: 'string', min: 2, max: 100 },
      age: { type: 'number', min: 10, max: 25 },
      position: {
        type: 'enum',
        values: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']
      }
    }
  },

  // Team validation schemas
  team: {
    create: {
      name: {
        type: 'string',
        required: true,
        min: 3,
        max: 100,
        transform: (v: string) => v.trim()
      },
      description: {
        type: 'string',
        max: 500
      },
      coachId: {
        type: 'string',
        pattern: /^[a-f0-9-]{36}$/
      }
    },
    update: {
      name: { type: 'string', min: 3, max: 100 },
      description: { type: 'string', max: 500 }
    },
    join: {
      inviteCode: {
        type: 'string',
        required: true,
        pattern: /^[A-Z0-9]{6,10}$/
      }
    }
  },

  // Food Entry validation schemas
  foodEntry: {
    create: {
      date: {
        type: 'date',
        required: true,
        custom: (value: any) => {
          const date = new Date(value);
          const today = new Date();
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          if (date > today) {
            return 'Cannot log food for future dates';
          }
          if (date < weekAgo) {
            return 'Cannot log food more than 7 days in the past';
          }
          return true;
        }
      },
      mealType: {
        type: 'enum',
        values: ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER', 'EVENING_SNACK', 'AFTER_PRACTICE'],
        required: true
      },
      time: {
        type: 'string',
        required: true,
        pattern: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      },
      location: {
        type: 'string',
        max: 100
      },
      description: {
        type: 'string',
        required: true,
        min: 3,
        max: 500
      },
      notes: {
        type: 'string',
        max: 500
      }
    },
    update: {
      mealType: {
        type: 'enum',
        values: ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER', 'EVENING_SNACK', 'AFTER_PRACTICE']
      },
      time: {
        type: 'string',
        pattern: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      },
      location: { type: 'string', max: 100 },
      description: { type: 'string', min: 3, max: 500 },
      notes: { type: 'string', max: 500 }
    }
  },

  // Performance Metric validation schemas
  performanceMetric: {
    create: {
      date: {
        type: 'date',
        required: true,
        custom: (value: any) => {
          const date = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          
          if (date > today) {
            return 'Cannot log metrics for future dates';
          }
          return true;
        }
      },
      energyLevel: {
        type: 'number',
        required: true,
        min: 1,
        max: 5
      },
      bedTime: {
        type: 'string',
        required: true,
        pattern: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      },
      wakeTime: {
        type: 'string',
        required: true,
        pattern: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      },
      isTrainingDay: {
        type: 'boolean',
        required: true
      },
      trainingType: {
        type: 'string',
        max: 100,
        custom: (value: any, data: any) => {
          if (data.isTrainingDay && !value) {
            return 'Training type is required for training days';
          }
          return true;
        }
      },
      matchDay: {
        type: 'boolean'
      },
      recoveryLevel: {
        type: 'number',
        min: 1,
        max: 5
      },
      hadRecoveryMeal: {
        type: 'boolean'
      },
      recoveryNotes: {
        type: 'string',
        max: 500
      },
      notes: {
        type: 'string',
        max: 500
      }
    }
  },

  // Nutrition Goal validation schemas
  nutritionGoal: {
    create: {
      goalType: {
        type: 'enum',
        values: ['daily_calories', 'protein_intake', 'carbs_intake', 'water_intake', 'vegetables', 'fruits'],
        required: true
      },
      targetValue: {
        type: 'number',
        required: true,
        min: 0,
        max: 10000
      },
      unit: {
        type: 'enum',
        values: ['calories', 'grams', 'liters', 'servings', 'pieces'],
        required: true
      },
      startDate: {
        type: 'date',
        required: true
      },
      endDate: {
        type: 'date',
        custom: (value: any, data: any) => {
          if (value && new Date(value) <= new Date(data.startDate)) {
            return 'End date must be after start date';
          }
          return true;
        }
      }
    },
    update: {
      targetValue: { type: 'number', min: 0, max: 10000 },
      endDate: { type: 'date' },
      isActive: { type: 'boolean' }
    }
  },

  // Achievement validation schemas
  achievement: {
    grant: {
      userId: {
        type: 'string',
        required: true,
        pattern: /^[a-f0-9-]{36}$/
      },
      type: {
        type: 'enum',
        values: ['streak', 'nutrition_score', 'consistency', 'milestone', 'improvement'],
        required: true
      },
      name: {
        type: 'string',
        required: true,
        min: 3,
        max: 100
      },
      description: {
        type: 'string',
        required: true,
        min: 10,
        max: 500
      },
      icon: {
        type: 'string',
        max: 50
      },
      metadata: {
        type: 'object'
      }
    }
  },

  // Food Library validation schemas
  foodLibrary: {
    create: {
      name: {
        type: 'string',
        required: true,
        min: 2,
        max: 100,
        transform: (v: string) => v.trim()
      },
      nameFi: {
        type: 'string',
        max: 100
      },
      category: {
        type: 'enum',
        values: ['protein', 'carbs', 'vegetables', 'fruits', 'dairy', 'snacks', 'beverages', 'other'],
        required: true
      },
      subcategory: {
        type: 'string',
        max: 50
      },
      nutritionData: {
        type: 'object',
        required: true,
        custom: (value: any) => {
          if (!value.calories || typeof value.calories !== 'number') {
            return 'Nutrition data must include calories';
          }
          if (!value.protein || typeof value.protein !== 'number') {
            return 'Nutrition data must include protein';
          }
          if (!value.carbs || typeof value.carbs !== 'number') {
            return 'Nutrition data must include carbs';
          }
          if (!value.fats || typeof value.fats !== 'number') {
            return 'Nutrition data must include fats';
          }
          return true;
        }
      },
      servingSizes: {
        type: 'array',
        custom: (value: any) => {
          if (!Array.isArray(value)) return true;
          
          for (const serving of value) {
            if (!serving.name || !serving.amount || !serving.unit) {
              return 'Each serving size must have name, amount, and unit';
            }
          }
          return true;
        }
      },
      isNordic: {
        type: 'boolean'
      },
      tags: {
        type: 'array',
        max: 10,
        custom: (value: any) => {
          if (!Array.isArray(value)) return true;
          
          if (value.some(tag => typeof tag !== 'string' || tag.length > 30)) {
            return 'Tags must be strings with max 30 characters';
          }
          return true;
        }
      },
      barcode: {
        type: 'string',
        pattern: /^[0-9]{8,13}$/
      },
      brand: {
        type: 'string',
        max: 100
      }
    },
    update: {
      name: { type: 'string', min: 2, max: 100 },
      nameFi: { type: 'string', max: 100 },
      category: {
        type: 'enum',
        values: ['protein', 'carbs', 'vegetables', 'fruits', 'dairy', 'snacks', 'beverages', 'other']
      },
      nutritionData: { type: 'object' },
      isVerified: { type: 'boolean' }
    }
  },

  // Common query validation
  query: {
    pagination: {
      limit: {
        type: 'number',
        min: 1,
        max: 100,
        transform: (v: any) => parseInt(v) || 20
      },
      offset: {
        type: 'number',
        min: 0,
        transform: (v: any) => parseInt(v) || 0
      },
      page: {
        type: 'number',
        min: 1,
        transform: (v: any) => parseInt(v) || 1
      }
    },
    dateRange: {
      startDate: {
        type: 'date',
        required: true
      },
      endDate: {
        type: 'date',
        required: true,
        custom: (value: any, data: any) => {
          if (new Date(value) < new Date(data.startDate)) {
            return 'End date must be after start date';
          }
          const daysDiff = (new Date(value).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff > 365) {
            return 'Date range cannot exceed 365 days';
          }
          return true;
        }
      }
    },
    search: {
      query: {
        type: 'string',
        required: true,
        min: 2,
        max: 100,
        transform: (v: string) => v.trim()
      },
      category: {
        type: 'string'
      },
      tags: {
        type: 'array'
      }
    }
  }
};

export default validationSchemas;