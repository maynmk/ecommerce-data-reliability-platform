param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("feat", "fix", "docs", "test", "refactor", "chore")]
    [string]$Type,

    [Parameter(Mandatory = $true)]
    [string]$Message
)

$branch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) {
    throw "Could not determine current branch."
}

git add .
git commit -m "$Type: $Message"
git push -u origin $branch
