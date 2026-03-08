import "server-only";

import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export interface UserRecord {
    uid: string;
    username: string;
    email: string;
    role: "admin" | "user";
    avatarUrl?: string | null;
    provider: "password" | "google";
    isVerified?: boolean;
    createdAt?: string;
}

export interface ContentBlock {
    type: string;
    content: unknown;
    order: number;
}

export interface ArchiveItemRecord {
    id: string;
    slug: string;
    title: string;
    category: string;
    subType?: string;
    thumbnail?: string | null;
    bodyContent: ContentBlock[];
    tags?: string[];
    authorUid?: string;
    authorName?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface SubmissionRecord {
    id: string;
    title: string;
    category: string;
    subType?: string | null;
    message: string;
    sourceLink?: string | null;
    submittedBy: string;
    submitterName: string;
    submitterEmail: string;
    status: "pending" | "approved" | "rejected";
    adminNotes?: string | null;
    reviewedBy?: string;
    reviewedAt?: string;
    publishedSlug?: string | null;
    createdAt?: string;
}

// Serialises Firestore Timestamps (and nested arrays/objects) to ISO strings
function serializeDoc(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (
            value != null &&
            typeof value === "object" &&
            "toDate" in value &&
            typeof (value as { toDate: unknown }).toDate === "function"
        ) {
            result[key] = (value as { toDate: () => Date }).toDate().toISOString();
        } else if (Array.isArray(value)) {
            result[key] = value.map((item) =>
                typeof item === "object" && item !== null
                    ? serializeDoc(item as Record<string, unknown>)
                    : item
            );
        } else {
            result[key] = value;
        }
    }
    return result;
}

function db() {
    return getFirebaseAdminDb();
}

// ──────────────────────────── Users ──────────────────────────────

export async function getUserByUid(uid: string): Promise<UserRecord | null> {
    const doc = await db().collection("users").doc(uid).get();
    if (!doc.exists) return null;
    return { uid, ...serializeDoc(doc.data()!) } as UserRecord;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
    const snap = await db().collection("users").where("email", "==", email).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { uid: doc.id, ...serializeDoc(doc.data()) } as UserRecord;
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
    const snap = await db().collection("users").where("username", "==", username).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { uid: doc.id, ...serializeDoc(doc.data()) } as UserRecord;
}

export async function upsertUser(uid: string, data: Record<string, unknown>): Promise<void> {
    await db().collection("users").doc(uid).set(data, { merge: true });
}

// ──────────────────────────── Archive Items ───────────────────────

export async function getArchiveItemBySlug(slug: string): Promise<ArchiveItemRecord | null> {
    const doc = await db().collection("archive_items").doc(slug).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...serializeDoc(doc.data()!) } as ArchiveItemRecord;
}

export async function slugExists(slug: string): Promise<boolean> {
    const doc = await db().collection("archive_items").doc(slug).get();
    return doc.exists;
}

export async function createArchiveItem(slug: string, data: Record<string, unknown>): Promise<void> {
    const now = Timestamp.now();
    await db()
        .collection("archive_items")
        .doc(slug)
        .set({ ...data, slug, createdAt: now, updatedAt: now });
}

export async function updateArchiveItemDoc(slug: string, data: Record<string, unknown>): Promise<void> {
    await db()
        .collection("archive_items")
        .doc(slug)
        .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function deleteArchiveItem(slug: string): Promise<void> {
    await db().collection("archive_items").doc(slug).delete();
}

export async function listArchiveItemsByCategory(category: string): Promise<ArchiveItemRecord[]> {
    const snap = await db()
        .collection("archive_items")
        .where("category", "==", category)
        .orderBy("createdAt", "desc")
        .get();
    return snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) } as ArchiveItemRecord));
}

export async function listArchiveItemsByCategoryAndSubType(
    category: string,
    subType: string
): Promise<ArchiveItemRecord[]> {
    const snap = await db()
        .collection("archive_items")
        .where("category", "==", category)
        .where("subType", "==", subType)
        .orderBy("createdAt", "desc")
        .get();
    return snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) } as ArchiveItemRecord));
}

export async function listAllArchiveSlugs(): Promise<string[]> {
    const snap = await db().collection("archive_items").select().get();
    return snap.docs.map((d) => d.id);
}

export async function paginateArchiveAdmin(
    query: string,
    page: number,
    limit: number
): Promise<{ items: ArchiveItemRecord[]; total: number; totalPages: number }> {
    const snap = await db().collection("archive_items").orderBy("createdAt", "desc").get();
    const all = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) } as ArchiveItemRecord));
    const q = query.toLowerCase();
    const filtered = q
        ? all.filter((item) =>
              [item.title, item.category, item.subType, item.slug].some(
                  (f) => f && String(f).toLowerCase().includes(q)
              )
          )
        : all;
    const total = filtered.length;
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), total, totalPages: Math.ceil(total / limit) };
}

export async function searchArchiveItems(query: string): Promise<ArchiveItemRecord[]> {
    const snap = await db()
        .collection("archive_items")
        .orderBy("createdAt", "desc")
        .limit(1000)
        .get();
    const all = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) } as ArchiveItemRecord));
    const q = query.toLowerCase();
    return all.filter((item) => {
        const fields = [
            item.title,
            item.category,
            item.subType,
            item.slug,
            item.profession,
            item.education,
            item.address,
            item.period,
            item.significance,
            item.traditionalName,
            item.foundedBy,
            item.missionStatement,
            item.headOfInstitution,
            item.currentStatus,
            ...(Array.isArray(item.achievements) ? item.achievements : []),
            ...(Array.isArray(item.tags) ? item.tags : []),
            ...(Array.isArray(item.toolsUsed) ? item.toolsUsed : []),
            ...(Array.isArray(item.destinations) ? item.destinations : []),
            ...(Array.isArray(item.involvedParties) ? item.involvedParties : []),
        ];
        return fields.some((f) => f && String(f).toLowerCase().includes(q));
    });
}

// ──────────────────────────── Submissions ────────────────────────

export async function createSubmission(data: Record<string, unknown>): Promise<string> {
    const ref = await db()
        .collection("submissions")
        .add({ ...data, status: "pending", createdAt: Timestamp.now() });
    return ref.id;
}

export async function listSubmissions(status?: string): Promise<SubmissionRecord[]> {
    const snap = await db().collection("submissions").orderBy("createdAt", "desc").get();
    let docs = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) } as SubmissionRecord));
    if (status) docs = docs.filter((d) => d.status === status);
    return docs;
}

export async function listSubmissionsByUser(uid: string): Promise<SubmissionRecord[]> {
    const snap = await db().collection("submissions").where("submittedBy", "==", uid).get();
    return snap.docs
        .map((d) => ({ id: d.id, ...serializeDoc(d.data()) } as SubmissionRecord))
        .sort((a, b) => (b.createdAt as string) > (a.createdAt as string) ? 1 : -1);
}

export async function getSubmission(id: string): Promise<SubmissionRecord | null> {
    const doc = await db().collection("submissions").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...serializeDoc(doc.data()!) } as SubmissionRecord;
}

export async function updateSubmissionDoc(id: string, data: Record<string, unknown>): Promise<void> {
    await db().collection("submissions").doc(id).update(data);
}

// ──────────────────────────── Contacts ───────────────────────────

export async function createContact(data: Record<string, unknown>): Promise<string> {
    const ref = await db()
        .collection("contacts")
        .add({ ...data, createdAt: Timestamp.now() });
    return ref.id;
}

export async function listContacts(): Promise<Record<string, unknown>[]> {
    const snap = await db()
        .collection("contacts")
        .orderBy("createdAt", "desc")
        .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));
}

export async function deleteSubmission(id: string): Promise<void> {
    await db().collection("submissions").doc(id).delete();
}

export async function deleteContact(id: string): Promise<void> {
    await db().collection("contacts").doc(id).delete();
}
