# QA Checklist

## Step-by-Step Scenario
1. **Reactions Tab**: Open the app, navigate to "Reactions Database".
2. **Select Reaction**: Click on the specific reaction. Verify the reaction details load correctly.
3. **Optimize Tab**: Navigate to "Optimizer" (or click "Optimize this reaction").
4. **Goal Selection**: Select a goal (e.g., Maximize Yield).
5. **Run Experiment**: Click "Start Optimization" and then click "Run Experiment" 4 times until completion.
6. **Verify Output**: 
   - Check the History Table for 4 iterations.
   - Check the Yield Chart for a clear trend.
   - Check the Optimal Conditions Card for the final best result.
7. **AI Assistant Tab**: Navigate to "AI Assistant".
8. **Ask Questions**: Ask standard questions to verify context-aware responses:
   - "Why did yield increase?"
   - "What happens if we increase temperature further?"
9. **Reset**: Go back to Reactions, select another reaction, and repeat.

## Test Runs

### Reaction 1 (r1): Neutralization: HCl + NaOH
- [ ] Reaction details loaded
- [ ] Goal selected (maxYield)
- [ ] 4 experiments run successfully
- [ ] History & Chart render correctly (no NaN, clear trend)
- [ ] Optimal Conditions Card appears
- [ ] AI Assistant answers correctly based on run context
- **Notes/Bugs**: 

### Reaction 2 (r2): Precipitation of Silver Chloride
- [ ] Reaction details loaded
- [ ] Goal selected (maxYield)
- [ ] 4 experiments run successfully
- [ ] History & Chart render correctly
- [ ] Optimal Conditions Card appears
- [ ] AI Assistant answers correctly based on run context
- **Notes/Bugs**: 

### Reaction 3 (r3): Decomposition of Hydrogen Peroxide
- [ ] Reaction details loaded
- [ ] Goal selected (minTime)
- [ ] 4 experiments run successfully
- [ ] History & Chart render correctly
- [ ] Optimal Conditions Card appears
- [ ] AI Assistant answers correctly based on run context
- **Notes/Bugs**: 

### Reaction 4 (r4): Synthesis of Ethyl Acetate
- [ ] Reaction details loaded
- [ ] Goal selected (maxYield)
- [ ] 4 experiments run successfully
- [ ] History & Chart render correctly
- [ ] Optimal Conditions Card appears
- [ ] AI Assistant answers correctly based on run context
- **Notes/Bugs**: 

### Reaction 5 (r5): Combustion of Methane
- [ ] Reaction details loaded
- [ ] Goal selected (minTime)
- [ ] 4 experiments run successfully
- [ ] History & Chart render correctly
- [ ] Optimal Conditions Card appears
- [ ] AI Assistant answers correctly based on run context
- **Notes/Bugs**: 
