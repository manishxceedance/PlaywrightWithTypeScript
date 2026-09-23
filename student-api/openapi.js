const inputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'email', 'age', 'course'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100, example: 'Taylor Morgan' },
    email: { type: 'string', format: 'email', maxLength: 254, example: 'taylor@example.test' },
    age: { type: 'integer', minimum: 3, maximum: 120, example: 21 },
    course: { type: 'string', minLength: 1, maxLength: 100, example: 'API Testing' }
  }
};
const studentReference = { $ref: '#/components/schemas/Student' };
const jsonResponse = (description, schema) => ({ description, content: { 'application/json': { schema } } });
const errorResponse = (description) => jsonResponse(description, { $ref: '#/components/schemas/Error' });
const commonResponses = {
  400: errorResponse('Invalid input'),
  401: errorResponse('Authentication required or credentials rejected'),
  429: errorResponse('Too many failed requests; retry after the rate-limit window'),
  500: errorResponse('Storage operation failed; the previous committed state is preserved')
};
const requestBody = {
  required: true,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/StudentInput' } } }
};
const idParameter = {
  name: 'id', in: 'path', required: true,
  description: 'UUID returned when the student was created.',
  schema: { type: 'string', format: 'uuid' }
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Student Records API', version: '1.0.0',
    description: 'CSV-backed student records. Only the latest 1,000 creations are retained; updates do not change retention order. All student operations require administrator authentication. Text fields reject control characters and spreadsheet formula prefixes.'
  },
  servers: [{ url: '/', description: 'Current server' }],
  security: [{ administratorAuth: [] }],
  tags: [{ name: 'Students' }],
  paths: {
    '/api/students': {
      get: {
        tags: ['Students'], operationId: 'listStudents', summary: 'List students',
        description: 'Newest creations first. Returns an empty data array when the requested page is beyond the available records.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000, default: 25 } }
        ],
        responses: { ...commonResponses, 200: jsonResponse('Paginated students', {
          type: 'object', properties: {
            data: { type: 'array', items: studentReference }, total: { type: 'integer', maximum: 1000 },
            page: { type: 'integer' }, limit: { type: 'integer' }, capacity: { type: 'integer', example: 1000 }
          }
        }) }
      },
      post: {
        tags: ['Students'], operationId: 'createStudent', summary: 'Create a student',
        description: 'Generates a UUID and timestamps. If the CSV already contains 1,000 students, the oldest creation is permanently removed in the same write.',
        requestBody,
        responses: { ...commonResponses, 413: errorResponse('Request body exceeds 16 KB'),
          201: { ...jsonResponse('Student created', studentReference),
            headers: { Location: { description: 'URL of the created student', schema: { type: 'string' } } } } }
      }
    },
    '/api/students/{id}': {
      parameters: [idParameter],
      get: {
        tags: ['Students'], operationId: 'getStudent', summary: 'Get a student',
        responses: { ...commonResponses, 200: jsonResponse('Student found', studentReference),
          404: errorResponse('Student does not exist or was removed by retention') }
      },
      put: {
        tags: ['Students'], operationId: 'updateStudent', summary: 'Update a student',
        description: 'Replaces all four editable fields. UUID and creation time remain unchanged.', requestBody,
        responses: { ...commonResponses, 200: jsonResponse('Student updated', studentReference),
          404: errorResponse('Student not found'), 413: errorResponse('Request body exceeds 16 KB') }
      },
      delete: {
        tags: ['Students'], operationId: 'deleteStudent', summary: 'Delete a student',
        responses: { ...commonResponses, 204: { description: 'Student deleted; no response body' },
          404: errorResponse('Student not found') }
      }
    }
  },
  components: {
    securitySchemes: {
      administratorAuth: {
        type: 'http', scheme: 'basic',
        description: 'Administrator credentials are provisioned privately on the server. Authorization is not persisted by this page. Use HTTPS outside localhost.'
      }
    },
    schemas: {
      StudentInput: inputSchema,
      Student: {
        type: 'object', additionalProperties: false,
        required: [...inputSchema.required, 'id', 'createdAt', 'updatedAt'],
        properties: { ...inputSchema.properties,
          id: { type: 'string', format: 'uuid', readOnly: true },
          createdAt: { type: 'string', format: 'date-time', readOnly: true },
          updatedAt: { type: 'string', format: 'date-time', readOnly: true }
        }
      },
      Error: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] }
    }
  }
};