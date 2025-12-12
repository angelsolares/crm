<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactRequest;
use App\Http\Requests\Contact\UpdateContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ContactController extends Controller
{
    public function __construct(
        protected ContactService $service
    ) {}

    /**
     * Display a listing of contacts.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only([
            'organization_id', 'status', 'category', 'primary_only',
            'search', 'sort_by', 'sort_dir'
        ]);

        $perPage = $request->input('per_page', 15);
        $contacts = $this->service->list($filters, $perPage);

        return ContactResource::collection($contacts);
    }

    /**
     * Store a newly created contact.
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Handle photo upload
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('contacts/photos', 'public');
        }
        unset($data['photo']);

        $contact = $this->service->create($data);

        return response()->json([
            'message' => 'Contact created successfully.',
            'data' => new ContactResource($contact->load('organization')),
        ], 201);
    }

    /**
     * Display the specified contact.
     */
    public function show(Contact $contact): ContactResource
    {
        return new ContactResource(
            $contact->load(['organization', 'projects', 'meetings'])
        );
    }

    /**
     * Update the specified contact.
     */
    public function update(UpdateContactRequest $request, Contact $contact): JsonResponse
    {
        $data = $request->validated();
        
        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo
            if ($contact->photo_path) {
                Storage::disk('public')->delete($contact->photo_path);
            }
            $data['photo_path'] = $request->file('photo')->store('contacts/photos', 'public');
        }
        unset($data['photo']);

        $contact = $this->service->update($contact, $data);

        return response()->json([
            'message' => 'Contact updated successfully.',
            'data' => new ContactResource($contact),
        ]);
    }

    /**
     * Remove the specified contact.
     */
    public function destroy(Contact $contact): JsonResponse
    {
        $this->service->delete($contact);

        return response()->json([
            'message' => 'Contact deleted successfully.',
        ]);
    }

    /**
     * Search contacts.
     */
    public function search(Request $request): AnonymousResourceCollection
    {
        $term = $request->input('q', '');
        $organizationId = $request->input('organization_id');
        $limit = $request->input('limit', 10);

        $contacts = $this->service->search($term, $organizationId, $limit);

        return ContactResource::collection($contacts);
    }

    /**
     * Get contacts for select dropdown.
     */
    public function forSelect(Request $request): JsonResponse
    {
        $organizationId = $request->input('organization_id');
        $contacts = $this->service->getForSelect($organizationId);

        return response()->json([
            'data' => $contacts->map(fn($contact) => [
                'id' => $contact->id,
                'full_name' => $contact->first_name . ' ' . $contact->last_name,
                'organization_id' => $contact->organization_id,
            ]),
        ]);
    }

    /**
     * Get contact statistics.
     */
    public function statistics(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getStatistics(),
        ]);
    }
}

