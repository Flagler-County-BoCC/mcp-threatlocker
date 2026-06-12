View ThreatLocker audit and action logs.

Usage:
  /tl-audit                            — last 50 audit entries across all orgs
  /tl-audit computer=DESKTOP-ABC       — filter by computer hostname
  /tl-audit org=FlaglerCounty          — filter by organization
  /tl-audit user=jsmith                — filter by user who took the action
  /tl-audit blocked                    — show only blocked application events
  /tl-audit days=7                     — look back N days (default: 1)

Steps:
1. Parse filters and the days lookback from arguments (default: 1 day)
2. Call `action_log_get_by_parameters` with the resolved filters and date range
3. If "blocked" keyword: filter results to blocked/denied actions only
4. Present results as a markdown table: Time, Computer, User, Application, Action (Allowed/Blocked), Policy, Organization
5. Highlight any BLOCKED rows prominently
6. If result count hits the page limit, note that and suggest narrowing the time window or adding filters
7. For unusual blocked patterns (same app blocked repeatedly), call out as a possible approval-request candidate
