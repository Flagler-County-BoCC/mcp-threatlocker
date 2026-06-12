List and manage ThreatLocker application approval requests.

Usage:
  /tl-approvals                  — list all pending approval requests
  /tl-approvals all              — include already-handled requests
  /tl-approvals org=FlaglerCounty — filter by organization
  /tl-approvals count            — show just the pending count by organization

Steps:
1. Parse any filters from the arguments
2. If "count" keyword: call `approval_request_get_count` and display a summary table of pending counts per org
3. Otherwise: call `approval_request_get_by_parameters` with filters; default to pending/unhandled only unless "all" is specified
4. Present results as a markdown table: Request ID, Application, Requested By, Computer, Organization, Date, Status
5. For each request, note the file path and whether ThreatLocker has research info on the application
6. If there are pending requests, remind that write access (MCP_WRITE_ALLOWLIST) is required to approve them
7. Suggest `/tl-approvals count` if there are many results
