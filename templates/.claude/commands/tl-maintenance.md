View and manage ThreatLocker maintenance mode windows.

Usage:
  /tl-maintenance                      — list all active maintenance windows
  /tl-maintenance computer=DESKTOP-ABC — show maintenance status for a specific computer
  /tl-maintenance end id=<mmId>        — end a maintenance window by ID (write required)
  /tl-maintenance new                  — show instructions for creating a new maintenance window (write required)

Steps:
1. Parse subcommand and filters from arguments
2. If "computer=X": resolve the computer then call `maintenance_mode_get_by_computer_id` with its ID
3. If "end id=X": call `maintenance_mode_end_by_id` — note this requires MCP_WRITE_ALLOWLIST to include `maintenance_mode_end_by_id`
4. If "new": explain the required fields (computerId, applicationId, start/end time) and show the `maintenance_mode_insert` tool signature; do not call it without explicit confirmation
5. Otherwise: call `maintenance_mode_get_by_computer_id` for all known computers or list active windows
6. Present results as a table: Computer, Organization, Application, Start, End, Created By
7. Flag any windows that are expired (end time in the past) and suggest ending them
