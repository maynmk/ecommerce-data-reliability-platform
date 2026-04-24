param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("feat", "fix", "docs", "test", "refactor", "chore")]
    [string]$Type,

    [Parameter(Mandatory = $true)]
    [string]$Name
)

$slug = $Name.ToLower()
$slug = $slug -replace "[^a-z0-9]+", "-"
$slug = $slug.Trim("-")

if ([string]::IsNullOrWhiteSpace($slug)) {
    throw "Task name produced an empty branch slug."
}

$branch = "$Type/$slug"
git checkout -b $branch
Write-Host "Created and switched to branch: $branch"
