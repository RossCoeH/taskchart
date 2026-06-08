import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { LogEntry, LogState, selectLogsAll } from "./logSlice";

export const LogViewer: React.FC<LogState> = () => {
    const [minSeverity, setMinSeverity] = useState(0);
    const [filterText, setFilterText] = useState("");
    const [excludeMatches, setExcludeMatches] = useState(false);

    const logs = useSelector(selectLogsAll) as LogEntry[];

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {

            // Severity filter
            if (log.e_num > minSeverity)
                return false;

            // Text filter
            if (filterText.trim() !== "") {
                const match = log.message
                    .toLowerCase()
                    .includes(filterText.toLowerCase());

                if (excludeMatches && match)
                    return false;

                if (!excludeMatches && !match)
                    return false;
            }

            return true;
        });
    }, [logs, minSeverity, filterText, excludeMatches]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    padding: "8px",
                    borderBottom: "1px solid #ccc"
                }}
            >
                <label>
                    Max Severity:
                    <select
                        value={minSeverity}
                        onChange={e => setMinSeverity(Number(e.target.value))}
                    >
                        <option value={0}>Error</option>
                        <option value={1}>Warn</option>
                        <option value={2}>Info</option>
                        <option value={3}>Debug</option>
                    </select>
                </label>

                <input
                    type="text"
                    placeholder="Filter text..."
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                />

                <label>
                    <input
                        type="checkbox"
                        checked={excludeMatches}
                        onChange={e => setExcludeMatches(e.target.checked)}
                    />
                    Exclude matches
                </label>

                <span>
                    {filteredLogs.length} / {logs.length}
                </span>
            </div>

            <div
                style={{
                    flex: 1,
                    overflow: "auto",
                    fontFamily: "Consolas, monospace",
                    fontSize: "13px"
                }}
            >
                {filteredLogs.map(log => (
                    <div
                        key={log.id}
                        style={{
                            padding: "2px 6px",
                            borderBottom: "1px solid #f0f0f0"
                        }}
                    >
                        <span style={{ width: 60, display: "inline-block" }}>
                            [{log.e_num}]
                        </span>
                        {log.message}
                    </div>
                ))}
            </div>
        </div>
    );
};