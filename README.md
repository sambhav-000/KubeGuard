# KubeGuard — Premium Kubernetes Self-Healing & Monitoring Platform

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)
![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.28+-326ce5?style=for-the-badge&logo=kubernetes)

> **KubeGuard** monitors Kubernetes workloads, detects failure signals in real time, tracks multi-cluster health, and orchestrates autonomous self-healing and recovery actions with enterprise-grade guardrails.

---

## 🚀 Key Features

- **Multi-Cluster Observability**: Real-time visibility into Kubernetes clusters, node capacities, pod lifecycle distributions, and live watch events.
- **Intelligent Incident Diagnostics**: Real-time detection of critical container failure patterns (`CrashLoopBackOff`, `OOMKilled`, readiness probe drops, replica imbalances) with automated root-cause analysis and container log dumps (`tail -n 4`).
- **Autonomous Self-Healing Engine**: Automated execution of remediation recipes (graceful rollout rollbacks, vertical memory patches, replica scaling) with clear distinction between native Kubernetes controllers and KubeGuard engine actions.
- **Infrastructure & Ingress Monitoring**: Time-series charts for CPU & Memory utilization, 80% threshold indicators, Network I/O, HTTP request rate, 5xx error spikes, and p95 latency tracking.
- **Rollback Guardrails & Deployment History**: Audit trail of deployment revisions, image tags, commit hashes, and one-click rollback triggers with confirmation dialogs.
- **Proactive Alert Policies**: Configurable threshold rules routing alerts directly to Slack, PagerDuty, Webhooks, or Email.
- **Tamper-Evident Audit Trail**: Immutable compliance logs recording human engineer interventions and autonomous orchestrations.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type contracts)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context (`DashboardContext`) with optimistic updates and interactive mutations

---

## 📁 Repository Structure

```
KubeGuard/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── alerts/         # Alert Rules & Threshold Policies
│   │   │   ├── audit/          # Compliance Audit Trail
│   │   │   ├── cluster/        # Cluster Explorer (Nodes & Events)
│   │   │   ├── deployments/    # Deployment Revisions & Rollbacks
│   │   │   ├── incidents/      # Incident Center & Diagnostics
│   │   │   ├── monitoring/     # Deep-dive Metrics & Charts
│   │   │   ├── self-healing/   # Autonomous Recovery Activity
│   │   │   ├── settings/       # Cluster Configuration & Credentials
│   │   │   ├── workloads/      # Deployments, StatefulSets, DaemonSets
│   │   │   ├── globals.css     # Global styles & animations
│   │   │   ├── layout.tsx      # Master layout with DashboardProvider
│   │   │   └── page.tsx        # Main Overview Dashboard
│   │   ├── components/
│   │   │   ├── dashboard/      # MetricCards, Charts, WorkloadTable, Timelines
│   │   │   ├── layout/         # Collapsible Sidebar & Topbar
│   │   │   └── ui/             # StatusBadges, Toast notifications, ConfirmModal
│   │   ├── context/            # Centralized DashboardContext
│   │   └── lib/                # TypeScript types & mock Kubernetes datasets
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### Setup & Run

```bash
# Navigate to frontend
cd KubeGuard/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 🔒 Zero-Trust Security Architecture

KubeGuard is architected so that sensitive cluster credentials (such as kubeconfig certificates, bearer tokens, or client keys) are **never exposed to the browser client**. All cluster communication is mediated through backend proxies or in-cluster RBAC `ServiceAccount` tokens.

