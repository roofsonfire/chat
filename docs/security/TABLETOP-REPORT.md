# Tabletop Exercise Report – January 16, 2026

**Scenario:** Compromised GitHub Actions workflow deploying malicious container to Cloud Run  
**Participants:** Engineering Lead (IC), Security Officer (Lead), Product Manager (Comms), DevOps Engineer (Scribe), CTO (Observer)  
**Duration:** 2 hours  
**Facilitator:** Security Officer

## Timeline

| Time (UTC) | Event                                                         |
| ---------- | ------------------------------------------------------------- |
| 18:00      | Exercise kickoff, objectives reviewed                         |
| 18:10      | Inject: Suspicious workflow commit triggers deployment        |
| 18:22      | Detection via `Auth Failure Spike` alert (Cloud Monitoring)   |
| 18:30      | Incident command established, comms channel activated         |
| 18:45      | Malicious Cloud Run revision isolated and rolled back         |
| 19:05      | Credentials rotated for CI/CD service accounts                |
| 19:30      | Outbound connections validated; no data exfiltration detected |
| 19:45      | Stakeholder status email sent                                 |
| 20:00      | Exercise debrief                                              |

## Outcomes & Observations

- **Detection:** Alert fired as expected; need PagerDuty integration for after-hours coverage.
- **Containment:** Rollback scripts worked but required manual edits—recommend parameterizing service name.
- **Communication:** Stakeholder template effective; include external comms draft for real incident.
- **Evidence Capture:** Scribe maintained detailed log in shared doc; plan to automate timeline extraction from Slack exports.
- **Tooling:** GitHub audit logs accessed successfully; recommend adding saved search for workflow changes.

## Action Items

1. Automate PagerDuty notifications for security alert policies (Owner: DevOps, due 2026-02-01).
2. Update manual deploy scripts to accept service name parameter (Owner: Platform, due 2026-01-25).
3. Draft external communication template for supply-chain incidents (Owner: Product, due 2026-02-07).
4. Implement Slack archive bot to export incident channel transcripts automatically (Owner: Security, due 2026-02-15).
5. Record Terraform module backlog issue for Cloud Run rollback automation (Owner: Platform, ticket INF-221).

## Lessons Learned

- Early detection was crucial; metrics tuned appropriately.
- Non-technical stakeholders appreciated frequent updates; maintain 30-minute cadence.
- Need a faster path to revoke GitHub PATs—investigate automating via GitHub API.
- Retention bucket audit trail provided immediate confirmation of log availability.

## Sign-off

- **Engineering Lead:** ✅
- **Security Officer:** ✅
- **CTO:** ✅
