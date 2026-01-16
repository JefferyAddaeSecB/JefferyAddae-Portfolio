import {
  users,
  contactMessages,
  leads,
  leadEvents,
  type User,
  type InsertUser,
  type ContactMessage,
  type InsertContactMessage,
  type Lead,
  type InsertLead,
  type LeadEvent,
  type InsertLeadEvent,
} from "@shared/schema";
import { getFirestore, isFirebaseConfigured } from "./firebase";

// interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  createLeadEvent(event: InsertLeadEvent): Promise<LeadEvent>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactMessages: Map<number, ContactMessage>;
  private leads: Map<number, Lead>;
  private leadEvents: Map<number, LeadEvent>;
  private userCurrentId: number;
  private messageCurrentId: number;
  private leadCurrentId: number;
  private leadEventCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contactMessages = new Map();
    this.leads = new Map();
    this.leadEvents = new Map();
    this.userCurrentId = 1;
    this.messageCurrentId = 1;
    this.leadCurrentId = 1;
    this.leadEventCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.messageCurrentId++;
    const createdAt = new Date().toISOString();
    const contactMessage: ContactMessage = { ...message, id, createdAt };
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.leadCurrentId++;
    const createdAt = new Date().toISOString();
    const newLead: Lead = { 
      ...lead,
      id, 
      createdAt,
      phone: lead.phone ?? null,
      company: lead.company ?? null,
      role: lead.role ?? null,
      tools: lead.tools ?? null,
      volumeRange: lead.volumeRange ?? null,
      timeline: lead.timeline ?? null,
      budgetRange: lead.budgetRange ?? null,
      dataSensitivity: lead.dataSensitivity ?? null,
      preferredContact: lead.preferredContact ?? null,
      tracking: lead.tracking ?? null,
    };
    this.leads.set(id, newLead);
    return newLead;
  }

  async createLeadEvent(event: InsertLeadEvent): Promise<LeadEvent> {
    const id = this.leadEventCurrentId++;
    const createdAt = new Date().toISOString();
    const newEvent: LeadEvent = { 
      ...event, 
      id, 
      createdAt,
      metadata: event.metadata ?? null,
    };
    this.leadEvents.set(id, newEvent);
    return newEvent;
  }
}

export class FirestoreStorage implements IStorage {
  private db: any;

  constructor() {
    const firestore = getFirestore();
    if (!firestore) {
      throw new Error('Firestore not configured');
    }
    this.db = firestore;
  }

  async getUser(id: number): Promise<User | undefined> {
    const doc = await this.db.collection('users').doc(String(id)).get();
    if (!doc.exists) return undefined;
    return doc.data() as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = await this.db.collection('users').where('username', '==', username).limit(1).get();
    if (q.empty) return undefined;
    const doc = q.docs[0];
    return doc.data() as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = Date.now();
    const user: User = { ...insertUser, id } as User;
    await this.db.collection('users').doc(String(id)).set(user);
    return user;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = Date.now();
    const createdAt = new Date().toISOString();
    const contactMessage: ContactMessage = { ...message, id, createdAt } as ContactMessage;
    await this.db.collection('contact_messages').doc(String(id)).set(contactMessage);
    return contactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const q = await this.db.collection('contact_messages').orderBy('createdAt', 'desc').get();
    return q.docs.map((d: any) => d.data() as ContactMessage);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = Date.now();
    const createdAt = new Date().toISOString();
    const newLead: Lead = { ...lead, id, createdAt } as Lead;
    await this.db.collection('leads').doc(String(id)).set(newLead);
    return newLead;
  }

  async createLeadEvent(event: InsertLeadEvent): Promise<LeadEvent> {
    const id = Date.now();
    const createdAt = new Date().toISOString();
    const newEvent: LeadEvent = { ...event, id, createdAt } as LeadEvent;
    await this.db.collection('lead_events').doc(String(id)).set(newEvent);
    return newEvent;
  }
}

let storageInstance: IStorage;
if (isFirebaseConfigured()) {
  try {
    storageInstance = new FirestoreStorage();
    console.log('✅ Using FirestoreStorage for persistence');
  } catch (err) {
    console.error('Failed to initialize FirestoreStorage, falling back to MemStorage', err);
    storageInstance = new MemStorage();
  }
} else {
  console.warn('Firebase not configured, using in-memory storage (MemStorage)');
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
