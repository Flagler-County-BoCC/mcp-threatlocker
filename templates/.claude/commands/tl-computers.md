Search and inspect ThreatLocker-managed computers.

Usage:
  /tl-computers                        — list all computers (first 50)
  /tl-computers hostname=DESKTOP-ABC   — filter by hostname (partial match)
  /tl-computers org=FlaglerCounty      — filter by organization name
  /tl-computers online                 — show only currently online devices
  /tl-computers id=<computerId>        — get full details for one computer

Steps:
1. Parse any filters from the arguments
2. If "online" keyword: call `online_devices_get_by_parameters` with any org/hostname filters
3. If "id=X" is given: call `computer_get_for_edit_by_id` with that computerId for full details
4. Otherwise: call `computer_get_by_all_parameters` with hostname/org filters (pageSize=50)
5. Present results as a markdown table: Hostname, Organization, OS, Protection Status, Agent Version, Last Check-in
6. If protection is disabled on any machine, flag it with a warning
7. If count exceeds 50, mention total and suggest narrowing the filter
