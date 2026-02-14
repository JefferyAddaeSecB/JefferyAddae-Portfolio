# Notion CRM Database Setup
## Complete Lead & Client Management System

---

## **DATABASE 1: LEADS PIPELINE**

### **Database Properties:**

| Property Name | Type | Options/Formula | Purpose |
|--------------|------|-----------------|---------|
| **Name** | Title | - | Full name of lead |
| **Email** | Email | - | Contact email |
| **Phone** | Phone | - | Phone number (optional) |
| **Company** | Text | - | Company name |
| **Industry** | Select | Tech, Retail, Healthcare, Finance, Real Estate, Other | Industry for personalization |
| **Goal/Service** | Select | Lead capture & follow-up, Customer support automation, Reporting/dashboards, Internal ops automation, Website/app build, Other | What they need |
| **Budget** | Select | $500-$1,200, $1,500-$4,000, $4,000-$10,000+, Not sure | Budget range |
| **Timeline** | Select | ASAP, 1-2 weeks, 2-4 weeks, Flexible | How soon they need it |
| **Details** | Long Text | - | Their message/requirements |
| **Score** | Number | 0-100 | Auto-calculated lead score |
| **Priority** | Select | 🔥 Hot (70+), ⚡ Warm (40-69), ❄️ Cold (<40) | Lead temperature |
| **Status** | Select | New Lead, Contacted, Meeting Scheduled, Proposal Sent, Negotiating, Won, Lost, On Hold | Sales stage |
| **Tags** | Multi-select | High Budget, Urgent, Has Company, Marketing Automation, Support Automation, Enterprise, SMB, Solo | Quick filters |
| **Source** | Select | Website Form, Cold Outreach, Referral, LinkedIn, YouTube, Other | Where they came from |
| **Captured Date** | Date | - | When they first contacted |
| **Last Contact** | Date | - | Last time you reached out |
| **Next Follow-Up** | Date | - | When to follow up next |
| **Emails Sent** | Number | - | Count of emails sent |
| **Replies Received** | Number | - | Count of replies |
| **Meeting Date** | Date | - | Scheduled call date/time |
| **Meeting Link** | URL | - | Zoom/Calendly link |
| **Proposal Link** | URL | - | Link to proposal doc |
| **Deal Value** | Number | $$ | Estimated project value |
| **Close Probability** | Select | 90%, 70%, 50%, 30%, 10% | Likelihood to close |
| **Expected Revenue** | Formula | `prop("Deal Value") * prop("Close Probability")` | Weighted pipeline value |
| **Owner** | Person | - | Who's handling this lead |
| **Notes** | Long Text | - | Internal notes |
| **Lost Reason** | Select | Budget, Timeline, Competition, No Response, Not Ready, Other | Why deal was lost |

---

### **DATABASE VIEWS:**

#### **View 1: 🔥 Hot Leads (Priority)**
**Filter:**
- Priority = "🔥 Hot"
- Status ≠ "Won" AND Status ≠ "Lost"

**Sort:**
- Captured Date (Newest first)

**Properties Shown:**
- Name, Email, Company, Goal, Budget, Timeline, Status, Next Follow-Up

**Purpose:** Your daily action list - contact these first!

---

#### **View 2: 📊 Pipeline Kanban**
**View Type:** Board

**Group By:** Status

**Filter:**
- Status ≠ "Lost"

**Cards Show:**
- Name
- Company
- Deal Value
- Next Follow-Up

**Purpose:** Visual sales pipeline - drag leads through stages

---

#### **View 3: 📅 Follow-Up Calendar**
**View Type:** Calendar

**Date Property:** Next Follow-Up

**Filter:**
- Status ≠ "Won" AND Status ≠ "Lost"

**Purpose:** Never miss a follow-up - see your week at a glance

---

#### **View 4: 💰 Deals Closing This Month**
**Filter:**
- Status = "Proposal Sent" OR "Negotiating"
- Meeting Date = This month

**Sort:**
- Close Probability (Descending)
- Deal Value (Descending)

**Purpose:** Focus on hot opportunities about to close

---

#### **View 5: 😴 Stale Leads (Need Attention)**
**Filter:**
- Status = "Contacted" OR "New Lead"
- Last Contact older than 7 days

**Sort:**
- Last Contact (Oldest first)

**Purpose:** Catch leads falling through the cracks

---

#### **View 6: 📈 Conversion Analytics**
**View Type:** Table

**Group By:** Source

**Properties:**
- Source
- Count (total leads)
- Avg Score
- Avg Deal Value
- Won deals
- Conversion Rate (formula)

**Purpose:** See which lead sources convert best

---

## **DATABASE 2: COLD OUTREACH PROSPECTS**

### **Database Properties:**

| Property Name | Type | Options | Purpose |
|--------------|------|---------|---------|
| **Company Name** | Title | - | Target company |
| **Contact Name** | Text | - | Decision maker name |
| **First Name** | Text | - | For personalization |
| **Email** | Email | - | Contact email |
| **LinkedIn** | URL | - | LinkedIn profile |
| **Website** | URL | - | Company website |
| **Industry** | Select | Same as Leads DB | Industry |
| **Company Size** | Select | 1-10, 11-50, 51-200, 201-500, 500+ | Employee count |
| **Pain Point** | Text | - | What they struggle with |
| **Why Them** | Text | - | Why you targeted them |
| **Status** | Select | Research, Ready to Contact, Email Sent, Replied, Meeting Booked, Moved to Leads, Not Interested, Bounced | Outreach stage |
| **Sequence** | Select | Sequence 1, Sequence 2, Sequence 3, Custom | Which email sequence |
| **Email 1 Sent** | Date | - | When first email sent |
| **Email 2 Sent** | Date | - | When follow-up 1 sent |
| **Email 3 Sent** | Date | - | When follow-up 2 sent |
| **Last Reply** | Date | - | When they last replied |
| **Emails Sent** | Number | - | Total emails |
| **Emails Opened** | Number | - | Opens tracked |
| **Links Clicked** | Number | - | Click tracking |
| **Reply Type** | Select | Interested, Not Interested, Not Now, Out of Office, Wrong Person | Response category |
| **Campaign** | Select | Jan 2026, Feb 2026, etc. | Batch tracking |
| **Added Date** | Date | - | When added to list |
| **Next Action** | Date | - | Next follow-up date |
| **Lead Score** | Number | 0-100 | Calculated score |
| **Notes** | Long Text | - | Research notes |

---

### **DATABASE VIEWS:**

#### **View 1: ✅ Ready to Contact**
**Filter:**
- Status = "Ready to Contact"
- Email = Not empty

**Sort:**
- Lead Score (Descending)

**Purpose:** Your daily outreach list

---

#### **View 2: ⏳ Awaiting Reply**
**Filter:**
- Status = "Email Sent"
- Email 1 Sent older than 3 days

**Purpose:** Prospects who need follow-up

---

#### **View 3: 🎯 Hot Responses**
**Filter:**
- Status = "Replied"
- Reply Type = "Interested"

**Sort:**
- Last Reply (Newest first)

**Purpose:** Interested prospects to move to Leads DB

---

#### **View 4: 📊 Campaign Performance**
**View Type:** Table

**Group By:** Campaign

**Aggregations:**
- Count (total sent)
- Avg Emails Opened
- Count Replied
- Count Moved to Leads

**Purpose:** Track campaign success rates

---

## **DATABASE 3: CLIENTS & PROJECTS**

### **Database Properties:**

| Property Name | Type | Options | Purpose |
|--------------|------|---------|---------|
| **Client Name** | Title | - | Client/company name |
| **Project Name** | Text | - | What you're building |
| **Contact Person** | Text | - | Main point of contact |
| **Email** | Email | - | Contact email |
| **Phone** | Phone | - | Phone number |
| **Project Type** | Select | Automation, Website, Dashboard, Custom Software, Consulting | Service type |
| **Status** | Select | Kickoff, In Progress, Review, Completed, On Hold, Cancelled | Project stage |
| **Start Date** | Date | - | Project start |
| **Deadline** | Date | - | Due date |
| **Completion Date** | Date | - | When finished |
| **Contract Value** | Number | $$ | Total project value |
| **Paid Amount** | Number | $$ | Amount received |
| **Outstanding** | Formula | `prop("Contract Value") - prop("Paid Amount")` | Balance due |
| **Payment Status** | Select | Deposit Paid, 50% Paid, Fully Paid, Overdue | Payment stage |
| **Hours Estimated** | Number | - | Estimated hours |
| **Hours Logged** | Number | - | Actual hours spent |
| **Progress** | Progress | 0-100% | Completion percentage |
| **Priority** | Select | 🔴 High, 🟡 Medium, 🟢 Low | Urgency level |
| **Next Milestone** | Text | - | Next deliverable |
| **Milestone Date** | Date | - | When milestone due |
| **Client Portal Link** | URL | - | Shared folder/portal |
| **Contract Link** | URL | - | Signed contract |
| **Invoice Links** | URL | - | Invoice documents |
| **GitHub Repo** | URL | - | Code repository |
| **Figma Link** | URL | - | Design files |
| **Satisfaction** | Select | 😍 Excellent, 🙂 Good, 😐 Okay, 😞 Poor | Client happiness |
| **Testimonial** | Long Text | - | Client testimonial |
| **Referrals Given** | Number | - | How many they referred |
| **Notes** | Long Text | - | Project notes |

---

### **DATABASE VIEWS:**

#### **View 1: 🚀 Active Projects**
**Filter:**
- Status = "In Progress" OR "Review"

**Sort:**
- Deadline (Soonest first)

**Properties:**
- Project Name, Client, Deadline, Progress, Next Milestone

**Purpose:** Daily project dashboard

---

#### **View 2: 💰 Payment Tracking**
**Filter:**
- Outstanding > 0

**Sort:**
- Outstanding (Highest first)

**Purpose:** Track unpaid invoices

---

#### **View 3: 📅 Timeline Calendar**
**View Type:** Timeline

**Start Date:** Start Date
**End Date:** Deadline

**Purpose:** Visual project timeline

---

#### **View 4: ⭐ Happy Clients (Testimonials)**
**Filter:**
- Satisfaction = "😍 Excellent"
- Status = "Completed"

**Purpose:** Clients to ask for testimonials/referrals

---

## **DATABASE 4: CONTENT & MARKETING**

Track your content for lead generation.

| Property Name | Type | Options | Purpose |
|--------------|------|---------|---------|
| **Title** | Title | - | Content title |
| **Type** | Select | YouTube Video, Blog Post, Case Study, Email Template, Social Post | Content type |
| **Topic** | Select | Automation, AI, Web Dev, Business Growth, Tools | Main topic |
| **Status** | Select | Idea, In Progress, Published, Scheduled | Production stage |
| **Publish Date** | Date | - | When it went live |
| **Link** | URL | - | Published URL |
| **Views** | Number | - | Total views |
| **Leads Generated** | Number | - | Leads from this content |
| **Keywords** | Multi-select | - | SEO keywords |
| **CTA** | Text | - | Call to action |
| **Performance** | Select | 🔥 Hot, ⚡ Good, 😐 Okay, 👎 Poor | How well it's doing |

---

## **AUTOMATION CONNECTIONS**

### **How N8N Connects to Notion:**

1. **Website Form Submit** → N8N → **Leads Pipeline DB**
2. **Cold Email Reply** → N8N → Update **Outreach Prospects DB**
3. **Meeting Booked** → N8N → Create in **Clients & Projects DB**
4. **Payment Received** → N8N → Update **Clients & Projects DB**

### **Example N8N → Notion Integration:**

```javascript
// When lead scores 70+
Notion.create({
  database: "Leads Pipeline",
  properties: {
    Name: lead.name,
    Email: lead.email,
    Score: lead.score,
    Priority: "🔥 Hot",
    Status: "New Lead",
    "Next Follow-Up": tomorrow
  }
});

// Send yourself a Slack/email alert
```

---

## **SETUP INSTRUCTIONS**

### **Step 1: Duplicate Template**
1. Copy this structure into Notion
2. Create 4 databases (Leads, Outreach, Clients, Content)
3. Add all properties listed above

### **Step 2: Connect to N8N**
1. Get Notion API key
2. Add Notion integration to N8N
3. Link your database IDs
4. Test with sample lead

### **Step 3: Customize**
- Adjust properties to fit your business
- Add/remove status options as needed
- Create custom views for your workflow

---

## **WEEKLY WORKFLOW**

**Monday Morning (30 min):**
- Review "🔥 Hot Leads" view
- Check "📅 Follow-Up Calendar" for week
- Update "💰 Deals Closing This Month"

**Daily (15 min):**
- Process new leads from website
- Send follow-ups from calendar
- Update project progress

**Friday Afternoon (30 min):**
- Review "😴 Stale Leads" - re-engage or archive
- Analyze "📊 Campaign Performance"
- Plan next week's outreach

---

🎯 **Goal: Spend max 1 hour/day in CRM with full pipeline visibility**
