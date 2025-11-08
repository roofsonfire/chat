# Tabletop Exercise Plan – Q1 2026

## Objective

Stress-test the incident response process for a compromised GitHub Actions workflow deploying a malicious image to production.

## Scope

- **Systems in scope:** GitHub Actions pipelines, Cloud Run deployment, monitoring/alerting stack, logging retention pipeline.
- **Teams involved:** Engineering, Security, DevOps/SRE, Product, Communications.

## Scenario Outline

1. Attacker compromises a maintainer’s GitHub PAT and pushes a workflow change that builds a malicious container.
2. Workflow bypasses standard review via misconfigured branch protection.
3. Malicious image is deployed to Cloud Run and begins exfiltrating prompt data.
4. Security tooling detects anomalous outbound connections.
5. Team must detect, contain, eradicate, and recover while communicating with stakeholders.

## Participants & Roles

| Role               | Primary          | Backup            | Responsibilities                        |
| ------------------ | ---------------- | ----------------- | --------------------------------------- |
| Incident Commander | Engineering Lead | Staff Engineer    | Coordinate response, maintain timeline  |
| Security Lead      | Security Officer | Security Engineer | Directs investigation, evidence capture |
| Communications     | Product Manager  | Marketing Lead    | Stakeholder updates, status reports     |
| Scribe             | DevOps Engineer  | QA Lead           | Document decisions, timestamps          |
| Observer           | CTO              | COO               | Provide executive oversight             |

## Agenda (2 hours)

1. **Preparation (15 min):** Review objectives, tooling, communication channels.
2. **Scenario Injection (10 min):** Facilitator briefs initial compromise details.
3. **Response Phase (45 min):** Team executes playbooks, escalates as needed.
4. **Containment & Recovery (30 min):** Rollback deployment, validate integrity, rotate credentials.
5. **Debrief (20 min):** Capture lessons learned, improvement backlog.

## Success Criteria

- Detection: Alert triggered within 10 minutes of malicious deployment.
- Containment: Malicious workload isolated within 30 minutes of detection.
- Communication: Stakeholders receive updates at 30 and 60 minutes.
- Documentation: Incident timeline, root cause, follow-up actions captured in `docs/security/TABLETOP-REPORT.md`.

## Preparation Checklist

- [ ] Verify on-call contact list is current.
- [ ] Ensure access to GitHub audit logs, Cloud Logging, Vertex AI usage metrics.
- [ ] Confirm rollback scripts (`deployment/MANUAL-DEPLOY-COMMANDS.md`) are tested.
- [ ] Review log retention runbook status and logging sink permissions.
- [ ] Set up dedicated Slack channel / Zoom bridge for exercise.

## Deliverables

1. Updated incident response playbooks (if gaps discovered).
2. Final report (`docs/security/TABLETOP-REPORT.md`) with timeline and action items.
3. Tracker of remediation tasks entered into issue backlog.

## Schedule

- **Target window:** Week of January 13, 2026.
- **Facilitator:** Security Officer.
- **Status:** Pending confirmation with executive sponsors (target sign-off by December 15, 2025).
