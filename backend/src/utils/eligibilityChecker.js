function checkEligibility(student, job) {
  const reasons = [];

  if (!student || !job) {
    return { eligible: false, reasons: ['Missing student or job data'] };
  }

  if (student.cgpa != null && job.minCgpa != null && student.cgpa < job.minCgpa) {
    reasons.push(`CGPA ${student.cgpa} below required ${job.minCgpa}`);
  }

  if (
    job.eligibleBranches &&
    job.eligibleBranches.length > 0 &&
    student.branch &&
    !job.eligibleBranches.includes(student.branch)
  ) {
    reasons.push(`Branch ${student.branch} not eligible`);
  }

  if (student.isPlaced) {
    reasons.push('Already placed');
  }

  return { eligible: reasons.length === 0, reasons };
}

module.exports = checkEligibility;
